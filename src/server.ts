import dotenv from 'dotenv';
import { buildExpress } from './buildExpress';
dotenv.config({ path: '.env' })

const app = buildExpress();

app.listen(process.env.PORT, 'localhost', () => {
    console.info(`Listening on port ${process.env.PORT}`)
});
