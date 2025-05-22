import { FullConfig } from '@playwright/test';
import type { Reporter, FullResult, Suite } from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import nodemailer from 'nodemailer';
import * as process from 'process';
import { mkdirSync } from 'fs';

// Ensure report directory exists
const REPORT_DIR = path.resolve(__dirname, 'test-report');
mkdirSync(REPORT_DIR, { recursive: true });

// File paths
const HISTORY_JSON_PATH = path.resolve(REPORT_DIR, '.test-failure-streak.json');
const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').split('Z')[0];
const EXCEL_PATH = path.resolve(REPORT_DIR, `test-failures-${timestamp}.xlsx`);

export default class HistoryReporter implements Reporter {
    private failureStreaks: Record<string, number> = {};

    onBegin(config: FullConfig) {
        if (fs.existsSync(HISTORY_JSON_PATH)) {
            try {
                this.failureStreaks = JSON.parse(fs.readFileSync(HISTORY_JSON_PATH, 'utf-8'));
            } catch {
                this.failureStreaks = {};
            }
        }
    }

    onTestEnd() {
        // No-op: final result is handled in onEnd
    }

    async onEnd(result: FullResult) {
        const failingTests: {
            suite: string;
            testName: string;
            fullPath: string;
            failedAge: number;
        }[] = [];

        const seenTests = new Set<string>();

        for (const project of (global as any)._pwTestConfig.projects || []) {
            for (const suite of project.suites || []) {
                this.collectResults(suite, failingTests, seenTests);
            }
        }

        // Remove entries not seen in this run
        for (const key of Object.keys(this.failureStreaks)) {
            if (!seenTests.has(key) || this.failureStreaks[key] === 0) {
                delete this.failureStreaks[key];
            }
        }

        // First-time failures
        const firstTimeFails = failingTests.filter(t => t.failedAge === 1);
        if (firstTimeFails.length > 0) {
            console.log('[HistoryReporter] First-time failures:');
            firstTimeFails.forEach(t => console.log(`  - ${t.fullPath}`));
        }

        // Sort by age and name
        failingTests.sort((a, b) => {
            if (a.failedAge !== b.failedAge) return a.failedAge - b.failedAge;
            return a.fullPath.localeCompare(b.fullPath);
        });

        // Write Excel
        const rows: string[][] = [['Test Suite', 'Test Name', 'Failed Age']];
        for (const { suite, testName, failedAge } of failingTests) {
            rows.push([suite, testName, failedAge.toString()]);
        }

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Current Failures');
        XLSX.writeFile(workbook, EXCEL_PATH);
        console.log(`[HistoryReporter] Wrote ${failingTests.length} failures to Excel: ${EXCEL_PATH}`);

        fs.writeFileSync(HISTORY_JSON_PATH, JSON.stringify(this.failureStreaks, null, 2));

        if (process.env.REPORT_EMAIL_SMTP_HOST) {
            await this.sendEmailReport();
        }

        if (process.env.GITHUB_ACTIONS === 'true') {
            await this.uploadArtifact();
        }
    }

    private collectResults(suite: Suite, failingTests: any[], seenTests: Set<string>) {
        for (const test of suite.tests) {
            const testKey = test.titlePath().join(' > ');
            seenTests.add(testKey);

            // Use the last meaningful result
            const lastMeaningful = [...test.results].reverse().find(r => r.status !== 'skipped');
            const finalStatus = lastMeaningful?.status || 'skipped';

            if (finalStatus === 'passed') {
                this.failureStreaks[testKey] = 0;
            } else if (finalStatus === 'failed') {
                this.failureStreaks[testKey] = (this.failureStreaks[testKey] || 0) + 1;

                const suiteName = test.titlePath().slice(0, -1).join(' > ');
                const testName = test.titlePath().slice(-1)[0];

                failingTests.push({
                    suite: suiteName,
                    testName,
                    fullPath: testKey,
                    failedAge: this.failureStreaks[testKey],
                });
            }
        }

        for (const child of suite.suites || []) {
            this.collectResults(child, failingTests, seenTests);
        }
    }

    private async sendEmailReport() {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.REPORT_EMAIL_SMTP_HOST,
                port: Number(process.env.REPORT_EMAIL_SMTP_PORT) || 587,
                secure: process.env.REPORT_EMAIL_SMTP_SECURE === 'true',
                auth: {
                    user: process.env.REPORT_EMAIL_SMTP_USER,
                    pass: process.env.REPORT_EMAIL_SMTP_PASS,
                },
            });

            const mailOptions = {
                from: process.env.REPORT_EMAIL_FROM || '"Playwright Reporter" <no-reply@example.com>',
                to: process.env.REPORT_EMAIL_TO,
                subject: `Playwright Test Failures Report - ${new Date().toLocaleString()}`,
                text: 'Please find attached the latest Playwright test failure report.',
                attachments: [
                    {
                        filename: path.basename(EXCEL_PATH),
                        path: EXCEL_PATH,
                    },
                ],
            };

            const info = await transporter.sendMail(mailOptions);
            console.log(`[HistoryReporter] Email sent: ${info.messageId}`);
        } catch (error) {
            console.error('[HistoryReporter] Failed to send email report:', error);
        }
    }

    private async uploadArtifact() {
        try {
            const exec = require('child_process').exec;
            const artifactName = 'playwright-failure-report';

            exec(`gh actions upload-artifact ${artifactName} ${EXCEL_PATH}`, (error: any, stdout: string, stderr: string) => {
                if (error) {
                    console.error(`[HistoryReporter] Artifact upload failed: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`[HistoryReporter] Artifact upload stderr: ${stderr}`);
                    return;
                }
                console.log('[HistoryReporter] Artifact uploaded successfully');
            });
        } catch (e) {
            console.error('[HistoryReporter] Failed artifact upload:', e);
        }
    }
}
