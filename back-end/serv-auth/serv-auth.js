import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import pool from '../serv-config/serv-config.js'
import * as utils from '../serv-utils/serv-utils.js'
import { EmailVerificationResultType, Recipient } from "mailersend";

import { authsql } from '../queries.js';
import { STATUS_CODES } from 'http';
import { match } from 'assert';

const app = express();
app.use(cors());
app.use(express.json());

const isLocal = !process.env.VERCEL;
const FRONTEND_URL = isLocal ? 'http://127.0.0.1:5500/front-end' : process.env.FRONTEND_URL;
///////////////////////////////////////////////////////////////////////////////////////////////////

app.post('/auth/signup', async (req, res) => {
    const userid = req.body.username;
    const email = req.body.email;
    const pwd = req.body.pwd;

    const pwdErrors = utils.validatePassword(pwd);
    if (!userid || !email || pwdErrors.length > 0) {
        return res.status(400).json({
            success: false,
            msg: pwdErrors.length > 0 ? pwdErrors.join(' ') : 'username and email are required'
        });
    }
    //repetitive check
    try {
        const rep_resp = await pool.query(authsql.signup_FetchUserID, [userid]);
        if (rep_resp.rowCount != 0) {
            return res.json({ success: false, msg: "account already exists" })
        }
    } catch (error) {
        console.error("database check error", error);
        return res.status(500).json({ success: false, msg: "database error" })
    }
    const client = await pool.connect();
    try {
        try {
            await client.query('begin');
            const salt = crypto.randomBytes(16).toString('hex');
            const pwd2 = await utils.hash(pwd, salt);
            const db_result = await client.query(authsql.signup_CreateNew_Account, [userid, email, pwd2, salt]);
            if (db_result.rowCount > 0) {
                const { token, url } = utils.random_generate_web();
                const v_receiver = [new Recipient(email, "receiver Alpha")];
                await client.query(authsql.signup_CreateNew_ev, [token, userid]);
                await client.query('commit');
                try {
                    const mailResponse = await utils.send_ver_mail(v_receiver, token, url, userid);
                    console.log('mailersend accepted verification email', {
                        statusCode: mailResponse.statusCode,
                        messageId: mailResponse.headers?.['x-message-id']
                    });
                    return res.json({ success: true, msg: "verification email has been accepted for delivery." });
                } catch (error) {
                    console.error('mailsend rejected request on sending v.mails,', {
                        statusCode: error?.statusCode,
                        body: error?.body,
                        message: error?.message
                    });
                    return res.status(502).json({
                        success: false,
                        accountCreated: true,
                        msg: 'account created but failed to send v.email'
                    })
                }
            } else {
                await client.query('rollback')
                return res.json({ success: false, msg: "invalid username or pwd" })
            }
        } catch (error) {
            console.error('signup error', error);
            try { await client.query('rollback'); } catch (_) { }
            res.status(500).json({ success: false, msg: "sth error?" })
        }
    } finally {
        client.release();
    }
});
app.post('/auth/token', async (req, res) => {
    const token = req.params.token;
    let client;
    try {
        client = await pool.connect();
        await client.query('begin');
        const result = await client.query(authsql.token_fetch, [token]);
        if (result.rowCount === 0) {
            await client.query('rollback');
            return res.redirect(`${FRONTEND_URL}/auth/confirm.html?status=invalid`);
        }
        const userid = result.rows[0].userid;
        await client.query(authsql.token_update_user, [userid]);
        await client.query(authsql.token_update_ev, [token]);
        await client.query(authsql.signup_CreateNew_Wallet, [userid]);
        await client.query('commit');
        return res.json(`${FRONTEND_URL}/auth/confirm.html`);
    } catch (error) {
        if (client) { try { await client.query('rollback'); } catch (_) { } }
        console.error('verify error', error);
        return res.redirect(`${FRONTEND_URL}/auth/confirm.html?status=error`);
    } finally {
        if (client) client.release();
    }
})
app.post('/auth/login', async (req, res) => {
    const userid = req.body.user_name;
    const pwd = req.body.passwd;
    try {
        const salt_result = await pool.query(authsql.signin_fetchpwd, [userid]);
        if (salt_result.rows.length === 0) {
            return res.json({ success: false, msg: "account not found" });
        }
        if (!salt_result.rows[0].verified) {
            return res.json({ success: false, msg: 'please verify your email first' })
        }
        const salt = salt_result.rows[0].salt;
        const saved_pwd = salt_result.rows[0].pwd;
        try {
            const enc_pwd = await utils.hash(pwd, salt);
            const calculated = Buffer.from(enc_pwd, 'hex');
            const stored = Buffer.from(saved_pwd, 'hex');

            const matches = calculated.length === stored.length && crypto.timingSafeEqual(calculated, stored);
            if (matches) {
                return res.json({ success: true, msg: 'success' });
            }
            return res.json({ success: false, msg: "error" })
        } catch (error) {
            res.status(500).json({ success: false, msg: 'error' });
        }
    } catch (error) {
        res.json({ success: false, msg: 'unknown error' })
    }
});
app.post('/reset', async (req, res) => {
    const email = req.body.email;
    try {
        //existence check
        const { rows } = await pool.query(authsql.reset_check_exists, [email]);
        if (rows[0].exists) {
            await utils.send_reset_email(email);
            console.log('reset email sent');
            return res.json({ success: true, msg: 'email has been sent' });
        } else {
            return res.json({ success: false, msg: 'account not found' });
        }
    } catch (err) {
        console.error(err);
        return res.json({ success: false, msg: 'server error' });
    }
});
app.get("/reset/:token", async (req, res) => {
    const token = req.params.token;
    res.redirect(`${FRONTEND_URL}/reset/resetTrue/resetTrue.html?token=${token}`);
});
app.post('/reset/updatepwd', async (req, res) => {
    const { token, newPwd } = req.body;
    const client = await pool.connect();
    try {
        await client.query('begin');
        const tokenCheck = await client.query(authsql.reset_select_email, [token]);
        if (tokenCheck.rowCount === 0) {
            await client.query('rollback');
            return res.json({ success: false, msg: 'invalid or expired token' });
        }
        const passwordErrors = utils.validatePassword(newPwd);

        if (passwordErrors.length > 0) {
            await client.query('rollback');
            return res.status(400).json({
                success: false,
                msg: passwordErrors.join(' ')
            });
        }

        const userEmail = tokenCheck.rows[0].email;
        const newSalt = crypto.randomBytes(16).toString('hex');
        const newHashedPwd = await utils.hash(newPwd, newSalt);
        await client.query(authsql.reset_pwd, [newHashedPwd, newSalt, userEmail]);
        await client.query(authsql.reset_status, [token]);
        await client.query('commit');
        return res.json({ success: true, msg: "pwd updated successfully" });
    } catch (error) {
        try { await client.query('rollback') } catch (_) { }
        console.error(`reset error:${error}`);
        return res.status(500).json({ success: false, msg: 'server error' })
    } finally {
        client.release();
    }
})



export default app;


