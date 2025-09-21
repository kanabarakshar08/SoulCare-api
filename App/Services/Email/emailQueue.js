    import Queue from 'bull';
    import WelcomeSendEmail from './welcomeEmail.js';

    const emailQueue = new Queue('emailQueue', process.env.REDIS_URL);

    emailQueue.process('sendEmail',async(job)=>{
        console.log(`Processing job ${job.id}...`);
        await WelcomeSendEmail.sendEmail(job.data);
        console.log(`Job ${job.id} completed`);
    
    });
    export default emailQueue;