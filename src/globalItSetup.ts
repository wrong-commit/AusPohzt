import dotenv from 'dotenv';

module.exports = function () {
    // console.log('Starting Global It Setup')
    // configure Test Environment process.env
    dotenv.config({ path: 'test.env' })
    // console.log('Finished Global It Setup')
}