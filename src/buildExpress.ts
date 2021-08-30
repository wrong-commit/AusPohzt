import express from 'express';
import setupRoutes from './routes/initRoutes';
function buildExpress() {
    // TODO: setup CORs, or let nginx handle ?
    // TODO: modify the app.listen() call to work for production environments
    // TODO: setup json support()
    const app = express();
    app.use(express.json());
    if (process.env.NODE_ENV === 'development') {
        // set express.response.json settings to control response formatting
        app.set('json spaces', 2);
        app.set('json replacer', null);
    }
    setupRoutes(app);

    app.use(handler => {
        // log request middleware
        console.log(`${Date.now().toLocaleString()} - ${handler.method} ${handler.url}`)
        if (handler.next) handler.next();
    });

    return app;
}


export { buildExpress }