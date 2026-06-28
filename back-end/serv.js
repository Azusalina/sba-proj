const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');


const nodemailer = require('nodemailer');

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


app.post('/api/login', async (req, res) => {
    const userid = req.body.user_name;
    const pwd = req.body.passwd;

    try {
        const sql_command = 'select * from user_infor where id=$1 and pwd=$2;'
        const db_result = await pool.query(sql_command, [userid, pwd]);
        if (db_result.rows.length > 0) {
            res.json({ success: true, msg: "success" });
        } else {
            res.json({ success: false, msg: "error" });
        }

    } catch (error) {
        res.status(500).json({ success: false, msg: "error" });
    }
});


const signup_receive_email = "";
app.post('/api/signup', async (req, res) => {
    const userid = req.body.username;
    const email = req.body.email;
    const pwd = req.body.pwd;
    const signup_receive_email = req.body.email;
    try {
        const sql_command = "insert into user_infor(id,email,pwd) values($1,$2,$3)";
        const db_result = await pool.query(sql_command, [userid, email, pwd]);
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


app.post('/opera_name', async (req, res) => {
    const op_name = req.body.a;
    try {
        const command = 'SELECT premium,std_high,std_low,budget from opera where opera_name=$1;';
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