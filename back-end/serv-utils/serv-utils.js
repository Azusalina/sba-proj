import 'dotenv/config';
import crypto from 'crypto';
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import pool from '../serv-config/serv-config.js';

const isLocal = !process.env.VERCEL;
const BACKEND_URL = isLocal ? 'http://127.0.0.1:3000' : process.env.BACKEND_URL;

const EmailSender = new MailerSend({ apiKey: process.env.MAILERSEND_API_KEY });
const NoreplySentFrom = new Sender("noreply@test-z0vklo6xwxpl7qrx.mlsender.net", "noreply verification");
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function hash(pwd, salt) {
    return crypto.createHash("sha256").update(pwd + salt).digest("hex");
}

export function random_generate_web() {
    const result = crypto.randomUUID().replace(/-/g, '');
    return {
        token: result,
        url: `${BACKEND_URL}/auth/${result}`
    };
}
export function random_generate_ResetWeb() {
    const result = crypto.randomUUID().replace(/-/g, '');
    return {
        token: result,
        url: `${BACKEND_URL}/reset/${result}`
    };
}
export async function send_ver_mail(target, token, url, userid) {
    const verification_mail = new EmailParams()
        .setFrom(NoreplySentFrom)
        .setTo(target)
        .setSubject("Signup Verification")
        .setHtml(`<p>Click here to verify your email: <a href="${url}">Verify Email</a></p>`);
    try {
        await EmailSender.email.send(verification_mail);
    } catch (err) {
        throw err;
    }
}
export async function send_confirmation_email(targetEmail, orderId, opera, showtime, level, sum_price, tickets) {
    const recipient = [new Recipient(targetEmail, "Opera Customer")];
    const ticketRows = tickets.map(t => `<li><strong>${t.ticketId}</strong> — Level: <em>${t.level}</em>, Class: <em>${t.seatClass2}</em></li>`).join('');
    const showtimeDisplay = showtime ? new Date(showtime).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }) : 'N/A';
    const htmlContent = `
        <h2>Booking Confirmation #${orderId}</h2>
        <p>Ticket Booking order record</p>
        <p><strong>Opera:</strong> ${opera}</p>
        <p><strong>Showtime:</strong> ${showtimeDisplay}</p>
        <p><strong>Seat Level:</strong> ${level}</p>
        <p><strong>Total Paid:</strong> HK$${sum_price}</p>
        <h3>Your Ticket IDs:</h3>
        <ul>${ticketRows}</ul>
    `;
    const emailParams = new EmailParams()
        .setFrom(NoreplySentFrom)
        .setTo(recipient)
        .setSubject(`Order Confirmation #${orderId} - ${opera}`)
        .setHtml(htmlContent);

    try {
        await EmailSender.email.send(emailParams);
    } catch (err) {
        console.error('Failed to send confirmation email:', err);
        throw err;
    }
}
export async function send_refund_email(targetEmail, orderId, opera, refundAmount) {
    const recipient = [new Recipient(targetEmail, "Opera Customer")];
    const htmlContent = `
        <h2>Refund Confirmation #${orderId}</h2>
        <p>Your refund has been processed successfully.</p>
        <p><strong>Opera:</strong> ${opera}</p>
        <p><strong>Refunded Amount:</strong> HK$${Number(refundAmount).toFixed(2)}</p>
        <p>The amount has been credited back to your wallet balance.</p>
    `;
    const emailParams = new EmailParams()
        .setFrom(NoreplySentFrom)
        .setTo(recipient)
        .setSubject(`Refund Confirmation #${orderId}`)
        .setHtml(htmlContent);

    try {
        await EmailSender.email.send(emailParams);
    } catch (err) {
        console.error('Failed to send refund email:', err);
        throw err;
    }
}
export async function send_reset_email(targetEmail) {
    const recipient = [new Recipient(targetEmail, 'request user')];
    const { token, url } = random_generate_ResetWeb();

    await pool.query(`INSERT INTO pwd_reset(email, token, expire_time, used) VALUES($1, $2, NOW() + INTERVAL '15 minutes', false)`, [targetEmail, token]);

    const htmlContent = `
        <h1>Reset your password</h1>
        <p>We have received a request to reset your password. If this request is from you, click <a href="${url}">here</a> to reset your password.</p>
    `;
    const emailParams = new EmailParams()
        .setFrom(NoreplySentFrom)
        .setTo(recipient)
        .setSubject('Reset your Password')
        .setHtml(htmlContent);

    try {
        await EmailSender.email.send(emailParams);
    } catch (error) {
        console.error('fail to send reset email:', error);
        throw error;
    }
}
///////////////////////////////////////////////////////////////
export function TimeToSeconds(timestr) {
    const [hr, min, sec] = timestr.split(':').map(Number);
    return hr * 3600 + min * 60 + sec;
}
export function getPricePlan(time) {
    const mid = '12:00:00';
    const targetDate = time ? new Date(time) : new Date();
    const midSec = TimeToSeconds(mid);
    const currentSec = targetDate.getHours() * 3600 + targetDate.getMinutes() * 60 + targetDate.getSeconds();
    if (currentSec <= 43200) {
        return 1;
    } else {
        return 2;
    }
}
//
export function sub_ID_time() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hr = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const sec = String(now.getSeconds()).padStart(2, '0');
    const result = `${yyyy}${mm}${dd} -${hr}${min}${sec} `;
    return result;
}
export function generate_TransacID() {
    const prefix = 'tx-';
    const time = `${sub_ID_time()} -`;
    const ID = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${time}${ID} `
}
export function generate_ticketID(operaName) {
    const prefix = `${operaName} -`
    const time = `${sub_ID_time()} -`;
    const ID1 = Math.random().toString(36).substring(2, 8).toUpperCase();
    const ID2 = Math.random().toString(36).substring(2, 8).toUpperCase();
    if (ID1 == ID2) { return generate_ticketID(operaName) };
    return `${prefix}${time}${ID1}${ID2} `
}

