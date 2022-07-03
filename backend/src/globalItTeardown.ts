import { pool } from './database/database';

export default function () {
    // console.log('Global It Teardown');
    pool.end();
}