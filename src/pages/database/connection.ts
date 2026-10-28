import { isIP } from 'node:net';
import sql from 'mssql';
import { environment, requireEnvironmentValue } from '../../config/environment';

export async function connectToDb(): Promise<sql.ConnectionPool> {
    try {
        const server = requireEnvironmentValue(environment.dbHost, 'DB_HOST');
        const config = {
            user: requireEnvironmentValue(environment.dbUser, 'DB_USER'),
            password: requireEnvironmentValue(
                environment.dbPassword,
                'DB_PASS'
            ),
            server,
            database: requireEnvironmentValue(
                environment.dbPrimaryName,
                'DB_PRIMARY_Name'
            ),
            options: {
                encrypt: true,
                trustServerCertificate: true,
                ...(isIP(server) === 0 ? { serverName: server } : {}),
            },
        };

        const pool = await new sql.ConnectionPool(config).connect();
        console.info('Connected to SQL Server');
        return pool;
    } catch (err) {
        throw new Error('Failed to connect to database', { cause: err });
    }
}

export async function closeDb(pool: sql.ConnectionPool): Promise<void> {
    await pool.close();
}

export async function executeQuery<T = unknown>(
    query: string,
    configureRequest?: (request: sql.Request) => void
): Promise<sql.IResult<T>> {
    const pool = await connectToDb();
    try {
        const request = pool.request();
        configureRequest?.(request);
        const result = await request.query<T>(query);
        return result;
    } catch (err) {
        throw new Error('Failed to execute database query', { cause: err });
    } finally {
        await closeDb(pool);
    }
}
