import { Client, Pool } from 'pg';

const host = (process.env.PG_HOST ?? '').length === 0 ? 'localhost' : process.env.PG_HOST;
const port = process.env.PG_PORT == undefined ? 5432 : process.env.PG_PORT!;

const config = {
    // TODO: use connectionstring ? 
    // server details
    host,
    port,
    // user details
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD+"",
    // database
    database: process.env.PG_DATABASE,
}

// TODO: specific debug property ? 
if (process.env.NODE_ENV === 'development') {
    console.log(`Using Database Config\n${JSON.stringify(config, null, 2)}`)
}

const pool = new Pool(config);

const client = new Client(config)

export { pool, client };
