import sql from 'mssql';

export async function connectToDb(): Promise<sql.ConnectionPool> {
    try {
        const config: sql.config = {
            user: process.env.DB_USER!,
            password: process.env.DB_PASS!,
            server: process.env.DB_HOST!, // must be a string, not undefined
            database: process.env.DB_NAME!,
            options: {
                encrypt: true,
                trustServerCertificate: true,
            },
        };

        const pool = await sql.connect(config);
        console.log('✅ Connected to the database');
        return pool;
    } catch (err) {
        console.error('❌ Database connection failed:', err);
        throw new Error('Failed to connect to DB');
    }
}

export async function closeDb(pool: sql.ConnectionPool): Promise<void> {
    await pool.close();
}

export async function executeQuery(query: string): Promise<sql.IResult<any>> {
    const pool = await connectToDb();
    try {
        const result = await pool.request().query(query);
        return result;
    } catch (err) {
        console.error('Query execution failed:', err);
        throw new Error('Failed to execute query');
    } finally {
        await closeDb(pool);
    }
}
