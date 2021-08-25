import express from 'express';
import setupRoutes from './routes/initRoutes';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' })

// TODO: setup CORs, or let nginx handle ?
// TODO: modify the app.listen() call to work for production environments
// TODO: setup json support()
const app = express();

setupRoutes(app);

app.use(handler => {
    // log request middleware
    console.log(`${Date.now().toLocaleString()} - ${handler.method} ${handler.url}`)
    if (handler.next) handler.next();
});

app.listen(process.env.PORT, 'localhost', () => {
    console.info(`Listening on port ${process.env.PORT}`)
});
