import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import pool from '../serv-config/serv-config.js'
import * as utils from '../serv-utils/serv-utils.js'
import { Recipient } from "mailersend";
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
    //repetitive check
    try {
        const rep_query = 'select id from user_infor where id=$1'
        const rep_resp = await pool.query(rep_query, [userid])
        if (rep_resp.rowCount != 0) {
            return res.json({ success: false, msg: "account already exists" })
        }
    } catch (error) {
        console.error("Database check error:", error);
        return res.json({ success: true, msg: "database error" })
    }
    try {
        await pool.query("BEGIN");
        const salt = crypto.randomBytes(16).toString('hex');
        const pwd2 = utils.hash(pwd, salt);
        const sql_command = "insert into user_infor(id,email,pwd,salt) values($1,$2,$3,$4)";
        const db_result = await pool.query(sql_command, [userid, email, pwd2, salt]);
        if (db_result.rowCount > 0) {
            //signup verify email here 
            const { token, url } = utils.random_generate_web();
            const v_receiver = [new Recipient(email, "Receiver alpha")];
            await pool.query(`INSERT INTO email_verification(token, userid, expire_time) VALUES($1, $2, NOW() + INTERVAL '1 day')`, [token, userid]);
            await pool.query("COMMIT");
            try {
                await utils.send_ver_mail(v_receiver, token, url, userid);
                console.log('mail has been sent.')
            } catch (err) {
                console.log('failed to send ver_email', err);
            }
            res.json({ success: true, msg: "ver_email has been sent to you,check your inbox" });
        } else {
            res.json({ success: false, msg: "Invalid username or password" });
        }
    } catch (error) {
        console.error("Signup process error:", error);
        await pool.query("ROLLBACK");
        res.status(500).json({ success: false, msg: "something error" });
    }
});
app.get("/auth/:token", async (req, res) => {
    console.log('route entered ')
    const token = req.params.token;
    console.log("token:", token);

    const result = await pool.query(`SELECT userid FROM email_verification WHERE token = $1 AND expire_time > NOW() AND used = FALSE`, [token]);
    console.log(result.rows);


    if (result.rowCount === 0) {
        console.log('invalid token')
        return res.redirect(`${FRONTEND_URL}/auth/confirm.html?status=invalid`);
    }

    const userid = result.rows[0].userid;

    await pool.query("UPDATE user_infor SET verified=TRUE WHERE id=$1", [userid]);
    await pool.query("UPDATE email_verification SET used=TRUE WHERE token=$1 and used=FALSE", [token]);
    console.log('successfully signup ')
    const usernameId = result.rows[0].userid;
    await pool.query(`INSERT INTO wallet(uid, balance) SELECT uid, 0.00 FROM user_infor WHERE id = $1 ON CONFLICT(uid) DO NOTHING`, [usernameId]);
    console.log('wallet successfully generated')
    console.log("before redirect");
    res.redirect(`${FRONTEND_URL}/auth/confirm.html`);
    console.log('redirected!')
});
app.post('/auth/login', async (req, res) => {
    const userid = req.body.user_name;
    const pwd = req.body.passwd;
    try {
        const salt_sql = 'select pwd,salt,verified from user_infor where id=$1';
        const salt_result = await pool.query(salt_sql, [userid]);
        if (salt_result.rows.length === 0) {
            return res.json({ success: false, msg: "account not found" })
        }
        if (!salt_result.rows[0].verified) {
            return res.json({ success: false, msg: "Please verify your email first" })
        }
        if (salt_result.rows.length > 0) {
            const salt = salt_result.rows[0].salt;
            const saved_pwd = salt_result.rows[0].pwd;
            try {
                const enc_pwd = utils.hash(pwd, salt);
                if (enc_pwd === saved_pwd) {
                    res.json({ success: true, msg: "success" });
                } else {
                    res.json({ success: false, msg: "error" });
                }
            } catch (error) {
                res.status(500).json({ success: false, msg: "error" });
            }
        } else {
            res.json({ success: false, msg: "account not found" })
        }
    } catch (error) {
        res.json({ success: false, msg: "unknown error" })
    }

});
//reset zone
app.post('/reset', async (req, res) => {
    const email = req.body.email;
    try {
        //existence check
        const { rows } = await pool.query('SELECT EXISTS(SELECT 1 FROM user_infor WHERE email=$1)', [email]);
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
    console.log("token:", token);
    res.redirect(`${FRONTEND_URL}/reset/resetTrue/resetTrue.html?token=${token}`);
});
app.post('/reset/updatepwd', async (req, res) => {
    const { token, newPwd } = req.body;

    try {
        await pool.query("BEGIN");
        //verify token still can be use
        const tokenCheck = await pool.query(`SELECT email FROM pwd_reset WHERE token = $1 AND expire_time > NOW() AND used = FALSE FOR UPDATE`, [token]);
        if (tokenCheck.rowCount === 0) {
            await pool.query("ROLLBACK");
            return res.json({ success: false, msg: "Invalid or expired token" });
        }
        const userEmail = tokenCheck.rows[0].email;
        const newSalt = crypto.randomBytes(16).toString('hex');
        const newHashedPwd = utils.hash(newPwd, newSalt);
        await pool.query(`UPDATE user_infor SET pwd = $1, salt = $2 WHERE email = $3`, [newHashedPwd, newSalt, userEmail]);
        await pool.query(`UPDATE pwd_reset SET used = TRUE WHERE token = $1`, [token]);
        await pool.query("COMMIT");
        return res.json({ success: true, msg: "Password updated successfully" });
    } catch (error) {
        await pool.query("ROLLBACK");
        console.error("Reset password error:", error);
        return res.status(500).json({ success: false, msg: "Server error" });
    }
})



export default app


