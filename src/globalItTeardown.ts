import { pool } from './database/pool';

module.exports = function () {
    // console.log('Global It Teardown');
    pool.end();
}