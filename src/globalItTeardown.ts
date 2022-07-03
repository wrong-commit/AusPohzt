import { pool } from './database/database';

module.exports = function () {
    // console.log('Global It Teardown');
    pool.end();
}