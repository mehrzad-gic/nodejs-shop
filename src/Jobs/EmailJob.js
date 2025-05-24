
import { log } from 'console';
import { logInfo } from '../Helpers/Helper.js';
import { sendMail } from '../Helpers/NoeMailer.js';

export default async (job) => {
    const { to, subject, text } = job.data;
    console.log(`processing Job start`,job.data)
    await sendMail({ to, subject, text });
    logInfo(`Email sent to ${to}`)
};
