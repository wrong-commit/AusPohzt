import express from 'express';
import cors from 'cors';
import setupRoutes from './routes/initRoutes';
import { attachToken } from './middleware/attachToken';
function buildExpress() {
    // TODO: setup actual CORs config
    // TODO: modify the app.listen() call to work for production environments
    const app = express();
    app.use(express.json());
    app.use(cors())
    if (process.env.NODE_ENV === 'development') {
        // set express.response.json settings to control response formatting
        app.set('json spaces', 2);
        app.set('json replacer', null);
    }
    app.use(attachToken);
    app.use(handler => {
        // log request middleware
        console.log(`${Date.now().toLocaleString()} - ${handler.method} ${handler.url}`)
        if (handler.next) handler.next();
    });

    setupRoutes(app);

    return app;
}


export { buildExpress }