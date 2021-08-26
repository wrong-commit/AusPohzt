import { Pool, Client } from 'pg';

const host = (process.env.PG_HOST ?? '').length === 0 ? 'localhost' : process.env.PG_HOST;
const port = (process.env.PG_PORT ?? '') === '' ? 0 : process.env.PG_PORT;

const config = {
    // TODO: use connectionstring ? 
    // server details
    host,
    port,
    // user details
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    // database
    database: process.env.PG_DATABASE,
}

const pool = new Pool(config);

const client = new Client(config)

export { pool, client }