const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const crypto = require('crypto')


//express is a network listener
const app = express();
//cors->cross origin resource sharing

app.use(cors());
app.use(express.json());

///////////////////
const pool = new Pool({
    user: 'a_sql',
    host: 'localhost',
    database: 'my_dev_db',
    password: 'a',
    port: 5432,
});

function hash(pwd, salt) {
    return crypto.createHash("sha256").update(pwd + salt).digest("hex");
}


app.post('/api/signup', async (req, res) => {
    const userid = req.body.username;
    const email = req.body.email;
    const pwd = req.body.pwd;
    const signup_receive_email = req.body.email;
    //repetitive check
    try {
        const rep_query = 'select id from user_infor where id=$1'
        const rep_resp = await pool.query(rep_query, [userid])
        if (rep_resp.rowCount != 0) {
            return res.json({ success: false, msg: "account already exists" })
        }
    } catch (error) {
        res.json({ success: true, msg: "error" })
    }
    try {
        const salt = crypto.randomBytes(16).toString('hex');
        const pwd2 = hash(pwd, salt);
        const sql_command = "insert into user_infor(id,email,pwd,salt) values($1,$2,$3,$4)";
        const db_result = await pool.query(sql_command, [userid, email, pwd2, salt]);
        if (db_result.rowCount > 0) {
            //signup verify email here 
            res.json({ success: true, msg: "success" });
        } else {
            res.json({ success: false, msg: "error" });
        }
    } catch (error) {
        res.status(500).json({ success: false, msg: "error" });
    }
})

app.post('/api/login', async (req, res) => {
    const userid = req.body.user_name;
    const pwd = req.body.passwd;
    try {
        const salt_sql = 'select pwd,salt from user_infor where id=$1';
        const salt_result = await pool.query(salt_sql, [userid]);
        if (salt_result.rows.length > 0) {
            const salt = salt_result.rows[0].salt;
            const saved_pwd = salt_result.rows[0].pwd;
            try {
                const enc_pwd = await hash(pwd, salt);
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

app.post('/opera_name', async (req, res) => {
    const op_name = req.body.a;
    try {
        const command = 'SELECT premium,std_high,std_low,budget from prices p left join opera o on p.opera_id=o.opera_id where o.opera_name=$1;';
        const db_result = await pool.query(command, [op_name]);
        if (db_result.rows.length > 0) {
            const row = db_result.rows[0];
            res.json(row);
        }
    } catch (error) {
        res.status(500).json({ msg: error });
    }
})






















app.listen(3000, () => {
    console.log("Service online");
});