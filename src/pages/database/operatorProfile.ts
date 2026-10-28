import sql from 'mssql';
import { executeQuery } from './connection';

type OperatorProfileRecord = {
    OperProfileId: number;
};

export async function getOperProfileId(
    loginName: string
): Promise<number | null> {
    const result = await executeQuery<OperatorProfileRecord>(
        `
            SELECT TOP 1 OperProfileId
            FROM OperatorProfile
            WHERE LoginNm = @loginName
            ORDER BY OperProfileId
        `,
        (request) => {
            request.input('loginName', sql.NVarChar, loginName);
        }
    );

    return result.recordset[0]?.OperProfileId ?? null;
}
