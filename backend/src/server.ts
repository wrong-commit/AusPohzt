import dotenv from 'dotenv';
dotenv.config({ path: '.env' })
import { buildExpress } from './buildExpress';

const app = buildExpress();

app.listen(process.env.PORT, '0.0.0.0', () => {
    console.info(`Listening on port ${process.env.PORT}`)
});
