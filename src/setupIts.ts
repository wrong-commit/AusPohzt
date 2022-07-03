import { pool } from './database/pool'

// clean all databases
async function cleanUpTables() {
    // console.log('Called cleanupTables()');
    // FIXME: get all tables. does \dt work ? 
    const tables = await pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema();')

    console.log(tables)
    // await pool.query(`TRUNCATE ${tables.rows.join(', ')};`);
}

module.exports = async () => {
    // console.debug('Truncating all tables');
    await cleanUpTables();
    // console.debug('Truncated all tables');
};