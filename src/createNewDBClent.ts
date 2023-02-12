const { Client } = require('pg');

export function createNewClient() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    return client;
}
