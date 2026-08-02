//header files
import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import cors from 'cors';
import crypto from 'crypto';
import 'dotenv/config';
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { time } from 'console';

export const app = express();
app.use(cors());
app.use(express.json());

//initialize

const pool = new Pool({
    user: 'a_sql',
    host: 'localhost',
    database: 'my_dev_db',
    password: 'a',
    port: 5432,
});

const ver_email = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY,
});
const NoreplySentFrom = new Sender("noreply@test-z0vklo6xwxpl7qrx.mlsender.net", "noreply verification");


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//subfunctions
function hash(pwd, salt) {
    return crypto.createHash("sha256").update(pwd + salt).digest("hex");
}
function random_generate_web() {
    const result = crypto.randomUUID().replace(/-/g, '');
    return {
        token: result,
        url: `http://127.0.0.1:3000/auth/${result}`
    };
}
async function send_ver_mail(target, token, url, userid) {
    const verification_mail = new EmailParams()
        .setFrom(NoreplySentFrom)
        .setTo(target)
        .setSubject("Signup Verification")
        .setHtml(`<p>Click here:<a href="${url}">Verify Email</a></p>`);
    try {
        await ver_email.email.send(verification_mail);
    } catch (err) {
        throw err;
    }
}

//

function TimeToSeconds(timestr) {
    const [hr, min, sec] = timestr.split(':').map(Number);
    return hr * 3600 + min * 60 + sec;
}


function getPricePlan(time) {
    const mid = '12:00:00';
    const current = new Date();
    const midSec = TimeToSeconds(mid);
    const currentSec = current.getHours() * 3600 + current.getMinutes() * 60 + current.getSeconds();
    if (currentSec <= 43200) {
        return 1;
    } else {
        return 2;
    }
}
////////////////////////////////////////////////////////////////////////////



//auth work zone


app.post('/api/signup', async (req, res) => {
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
        const pwd2 = hash(pwd, salt);
        const sql_command = "insert into user_infor(id,email,pwd,salt) values($1,$2,$3,$4)";
        const db_result = await pool.query(sql_command, [userid, email, pwd2, salt]);
        if (db_result.rowCount > 0) {
            //signup verify email here 
            const { token, url } = random_generate_web();
            const v_receiver = [new Recipient(email, "Receiver alpha")];
            await pool.query(`INSERT INTO email_verification(token, userid, expire_time) VALUES($1,$2,NOW()+INTERVAL '1 day')`, [token, userid]);
            await pool.query("COMMIT");
            try {
                await send_ver_mail(v_receiver, token, url, userid);
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

    const result = await pool.query(`SELECT userid FROM email_verification WHERE token=$1 AND expire_time > NOW() AND used = FALSE`, [token]);
    console.log(result.rows);


    if (result.rowCount === 0) {
        console.log('invalid token')
        return res.redirect("/confirm.html?status=invalid");
    }

    const userid = result.rows[0].userid;

    await pool.query("UPDATE user_infor SET verified=TRUE WHERE id=$1", [userid]);
    await pool.query("UPDATE email_verification SET used=TRUE WHERE token=$1 and used=FALSE", [token]);
    console.log('successfully signup ')
    const usernameId = result.rows[0].userid;
    await pool.query(`INSERT INTO wallet(uid, balance) SELECT uid, 0.00 FROM user_infor WHERE id = $1 ON CONFLICT (uid) DO NOTHING`, [usernameId]);
    console.log('wallet successfully generated')
    console.log("before redirect");
    res.redirect("http://127.0.0.1:5500/front-end/auth/confirm.html");
    console.log('redirected!')
});
app.post('/api/login', async (req, res) => {
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
                const enc_pwd = hash(pwd, salt);
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
        res.json({ msg: "unknown error" })
    }

});




//settings fetch data work zone

app.post('/settingGetData', async (req, res) => {
    const username = req.body.username;
    try {
        const command = 'select u.uid,u.id,u.create_at,u.email,u.birth,w.balance from user_infor u left join wallet w on u.uid=w.uid where u.id=$1'
        const { rows } = await pool.query(command, [username]);
        if (rows.length > 0) {
            res.json(rows[0])
        } else {
            res.json({ msg: 'account not found' })
        }
    } catch (error) {
        console.log(error)
        res.json({ msg: 'unknown or fatal error' })
    }
})


//redeem
app.post('/redeem', async (req, res) => {
    const user = req.body.user;
    const code = req.body.code;
    try {
        await pool.query('BEGIN');
        const command = 'select * from gift_code where code=$1 for update'
        const { rows } = await pool.query(command, [code])

        if (rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.json({ msg: 'invalid' });
        }
        if (rows[0].current_status === true) {
            await pool.query('ROLLBACK');
            return res.json({ msg: 'already redeemed' });
        }
        const amount = rows[0].amount;
        const walletResult = await pool.query('UPDATE wallet SET balance = balance + $1 WHERE uid = (SELECT uid FROM user_infor WHERE id = $2) returning balance ', [amount, user]);
        if (walletResult.rowCount === 0) {
            await pool.query('ROLLBACK');
            return res.json({ msg: 'unknown fatal error' });
        }
        await pool.query('update gift_code set current_status=true,claim_by=$1,claim_time=now() where code=$2', [user, code]);
        await pool.query('COMMIT');
        console.log('amount successfully added into user wallet,Updated balance fetched.')
        const balance = walletResult.rows[0].balance;
        return res.json({ msg: 'redeemed', balance: balance });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.log(error)
        return res.json({ msg: 'unknown fatal error' })

    }
})







//search work zone

app.post('/updateOperaData', async (req, res) => {
    const op_name = req.body?.name;
    const planID = getPricePlan();
    try {
        if (op_name) {
            const command = 'SELECT o.opera_id, o.opera_name, o.show_time, o.rate, o.duration, p.budget AS price FROM opera o LEFT JOIN prices p ON o.opera_id = p.opera_id WHERE o.opera_name = $1 and p.price_id=$2';
            const { rows } = await pool.query(command, [op_name, planID]);
            if (rows.length > 0) {
                return res.json({ status: true, data: rows[0], plan: planID });
            } else {
                return res.json({ status: false, msg: 'opera not found' });
            }
        } else {
            const command = 'SELECT o.opera_id, o.opera_name, o.show_time, o.rate, o.duration, p.budget AS price FROM opera o LEFT JOIN prices p ON o.opera_id = p.opera_id WHERE p.price_id=$1 ORDER BY o.opera_id ASC';
            const { rows } = await pool.query(command, [planID]);
            return res.json({ status: true, data: rows, plan: planID });
        }
    } catch (error) {
        console.log(error);
        return res.json({ status: false, msg: 'data not found' });
    }
});

//book work zone
app.post('/operaName', async (req, res) => {
    const operaName = req.body.name;
    const priceID = getPricePlan();
    const sqlQuery = `SELECT premium, std_high, std_low, budget FROM prices p LEFT JOIN opera o ON p.opera_id = o.opera_id WHERE LOWER(REPLACE(o.opera_name, ' ', '-')) = $1 AND p.price_id = $2`
    try {
        const { rows: prices } = await pool.query(sqlQuery, [operaName, priceID])
        const { rows: multipliers } = await pool.query('select name,multiplier from lv')
        if (prices.length > 0) {
            return res.json({ status: true, prices: prices[0], multipliers: multipliers })
        } else {
            return res.json({ status: false, msg: 'price not found' })
        }
    } catch (error) {
        console.log(error)
        return res.json({ status: false, msg: 'unknown fatal error' })
    }
})





//toolkit zone


app.post('/toolkit/gen_redeem_code', async (req, res) => {
    const code = req.body.code;
    const value = req.body.value;
    let status = false;
    try {
        await pool.query('insert into gift_code(code,amount) values($1,$2)', [code, value]);
        console.log(`gift code generated:${code}`)
        status = true;
    } catch (error) {
        console.log(error);
        status = false;
    }
    if (status) {
        return res.json({ msg: 'success' })
    } else {
        return res.json({ msg: 'fail' })
    }
})



























app.listen(3000, () => {
    console.log(":3000,Service online,Please start.");
});
