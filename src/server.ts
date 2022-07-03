import dotenv from 'dotenv';
dotenv.config({ path: '.env' })
import { buildExpress } from './buildExpress';

const app = buildExpress();

app.listen(process.env.PORT, 'localhost', () => {
    console.info(`Listening on port ${process.env.PORT}`)
});
