import express from 'express';
import Auth from './Auth/_router.js';
import ChatBot from './ChatBot/_router.js';
import Therapy from './Therapy/_router.js';
import Appointment from './Appointment/_router.js';
import Contact from './Contact/_router.js';
import Payment from './Payment/_router.js';

const app = express();
app.use(express.json());

app.use('/auth', Auth);
app.use('/chatbot', ChatBot);
app.use('/therapy', Therapy);
app.use('/appointments', Appointment);
app.use('/contact', Contact);
app.use('/payments', Payment);

export default app;
