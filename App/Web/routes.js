import 'dotenv/config';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import express, { json } from 'express';
import { errorHandler } from '../Middleware/Error.js';
import { responseHandler } from '../Middleware/ResponseHandler.js';
import router from '../Controllers/_router.js';

export default (app) => {


    app.use((req, res, next) => {
        // const skipCorsRoutes = [
        //     '/api/auth/payment-success',
        //     '/api/auth/payment-fail',
        // ];

        // if (skipCorsRoutes.some(path => req.path.startsWith(path))) {
        //     return next();
        // }

        cors({
            origin: function (origin, callback) {
                if (!origin) return callback(null, true);

                if (/^http:\/\/localhost:\d+$/.test(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true,
        })(req, res, next);
    });

    const __dirname = path.resolve();
    const publicDirectoryPath = path.join(__dirname, 'public');
    app.use('/api/public', express.static(publicDirectoryPath));

    app.use(getType);

    app.use(responseHandler);

    app.use(session({
        secret: process.env.JWT_PRIVATE_KEY,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    }));

    app.set('trust proxy', true);

    app.use(express.urlencoded({ extended: true }));

    app.use(express.json());

    app.use((req, res, next) => {
        let ip = req.ip || req.connection.remoteAddress;

        if (ip === '::1') ip = '127.0.0.1';
        if (ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');

        req.clientIp = ip;
        next();
    });

    app.use('/api', router);

    app.use(helmet());
    app.use(json());

    app.use((req, res) => {
        res.status(404).send({ message: 'Url Not Found.' });
    });

    app.use(errorHandler);

}

const getType = (req, res, next) => {
    req.type = req.headers['type'] || 'web';
    next();
};
