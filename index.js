import 'dotenv/config';
import express from 'express';
import db from './App/Database/db.js';
import router from './App/Web/routes.js';
import { icon } from './App/Database/icon.js';
import Response from './App/utils/response.js';
// import handleSocket from './App/Services/Socket.js';
import errorHandler from './App/Exceptions/Handler.js';
import models from './App/Models/EloquentCollection.js';
const app = express();



await db();
models();
router(app);
errorHandler();

// Global utilities
global.Response = Response;
global.adminContactEmail = ""

// const { server, io } = await handleSocket(app);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(icon);
    console.log(`⚡️[NodeJs server]: Server is running at http://localhost:${PORT}`);
    // io.on('connection', (Socket) => connectionHandler(io, Socket));
});
