import dotenv from 'dotenv';

export default function () {
    // console.log('Starting Global It Setup')
    // configure Test Environment process.env
    dotenv.config({ path: 'test.env' })
    // console.log('Finished Global It Setup')
}