import express from 'express';
import cors from 'cors';

import pool from '../serv-config/serv-config.js';
import * as utils from '../serv-utils/serv-utils.js';
import { Recipient } from "mailersend";

const app = express();
app.use(cors());
app.use(express.json());

app.post('/settingGetData', async (req, res) => {
    const username = req.body.username;
    try {
        const command = 'select u.uid,u.id,u.create_at,u.email,u.birth,w.balance from user_infor u left join wallet w on u.uid=w.uid where u.id=$1';
        const { rows } = await pool.query(command, [username]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.json({ msg: 'account not found' });
        }
    } catch (error) {
        console.log(error);
        res.json({ msg: 'unknown or fatal error' });
    }
});
//auth-main collaborated port added 08.08.2026,refund
app.post('/settingsGetOrders', async (req, res) => {
    const username = req.body.username;
    try {
        const query = `
            SELECT o.order_id, o.book_time, o.transac_time, o.transac_method, o.sum_fee, o.transac_status,
                   (SELECT op.opera_name FROM ticket t JOIN opera op ON op.opera_id = t.opera_id WHERE t.order_id = o.order_id LIMIT 1) AS opera_name,
                   (SELECT json_agg(json_build_object('seat_class', grp.seat_class, 'seat_class2', grp.seat_class2, 'count', grp.cnt))
                    FROM (SELECT seat_class, seat_class2, COUNT(*) AS cnt
                          FROM ticket
                          WHERE order_id = o.order_id
                          GROUP BY seat_class, seat_class2) grp
                   ) AS ticket_breakdown
            FROM orders o
            JOIN user_infor u ON o.uid = u.uid
            WHERE u.id = $1
            ORDER BY o.book_time DESC
        `;
        const { rows } = await pool.query(query, [username]);
        return res.json({ status: true, orders: rows });
    } catch (error) {
        console.error(error);
        return res.json({ status: false, orders: [] });
    }
});
app.post('/refundOrder', async (req, res) => {
    const { user, order_id } = req.body;
    try {
        await pool.query('BEGIN');
        const orderRes = await pool.query(
            `SELECT o.order_id, o.uid, o.sum_fee, o.transac_status
             FROM orders o
             JOIN user_infor u ON o.uid = u.uid
             WHERE o.order_id = $1 AND u.id = $2
             FOR UPDATE`,
            [order_id, user]
        );
        if (orderRes.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.json({ msg: 'not_found' });
        }
        const order = orderRes.rows[0];
        if (order.transac_status !== 'COMPLETED') {
            await pool.query('ROLLBACK');
            return res.json({ msg: 'not_refundable' });
        }
        const refundAmount = parseFloat(order.sum_fee);
        const walletRes = await pool.query(
            'UPDATE wallet SET balance = balance + $1, updated_at = NOW() WHERE uid = $2 RETURNING balance',
            [refundAmount, order.uid]
        );
        const newBalance = parseFloat(walletRes.rows[0].balance);
        const txId = utils.generate_TransacID();
        await pool.query(
            `INSERT INTO wallet_transaction (tx_id, uid, order_id, tx_type, amount, running_balance, source_destination, description)
             VALUES ($1, $2, $3, 'CREDIT', $4, $5, 'ORDER_REFUND', $6)`,
            [txId, order.uid, order_id, refundAmount, newBalance, `Refund for order #${order_id}`]
        );
        await pool.query(
            `UPDATE orders SET transac_status = 'REFUNDED' WHERE order_id = $1`,
            [order_id]
        );
        const infoRes = await pool.query(
            `SELECT u.email, op.opera_name
             FROM user_infor u, ticket t
             JOIN opera op ON op.opera_id = t.opera_id
             WHERE u.id = $1 AND t.order_id = $2
             LIMIT 1`,
            [user, order_id]
        );
        await pool.query('COMMIT');
        if (infoRes.rows.length > 0 && infoRes.rows[0].email) {
            try {
                await utils.send_refund_email(infoRes.rows[0].email, order_id, infoRes.rows[0].opera_name, refundAmount);
            } catch (mailErr) {
                console.error('refund email failed but refund succeeded:', mailErr);
            }
        }
        return res.json({ msg: 'success', balance: newBalance });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Refund Error:', error);
        return res.json({ msg: 'error' });
    }
});
app.post('/redeem', async (req, res) => {
    const user = req.body.user;
    const code = req.body.code;
    try {
        await pool.query('BEGIN');
        const command = 'select * from gift_code where code=$1 for update';
        const { rows } = await pool.query(command, [code]);

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
        const balance = walletResult.rows[0].balance;
        return res.json({ msg: 'redeemed', balance: balance });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.log(error);
        return res.json({ msg: 'unknown fatal error' });
    }
});

app.post('/updateOperaData', async (req, res) => {
    try {
        const query = `SELECT o.opera_id, o.opera_name, o.duration, o.rate, p.price_id, p.budget, p.time AS showtime FROM opera o LEFT JOIN prices p ON o.opera_id = p.opera_id ORDER BY o.opera_id, p.price_id;`;
        const { rows } = await pool.query(query);
        const operaMap = {};
        rows.forEach(row => {
            if (!operaMap[row.opera_id]) {
                operaMap[row.opera_id] = {
                    id: row.opera_name.toLowerCase().replace(/\s+/g, '-'),
                    name: row.opera_name,
                    duration: row.duration,
                    rate: row.rate,
                    plans: []
                };
            }
            operaMap[row.opera_id].plans.push({
                price_id: row.price_id,
                budget: row.budget,
                time: row.showtime
            });
        });
        res.json({ status: true, data: Object.values(operaMap) });
    } catch (err) {
        console.error(err);
        res.json({ status: false, data: [] });
    }
});

app.post('/operaName', async (req, res) => {
    const operaName = req.body.name;
    const selectedTime = req.body.time;
    const priceID = utils.getPricePlan(selectedTime);
    const sqlQuery = `SELECT premium, std_high, std_low, budget FROM prices p LEFT JOIN opera o ON p.opera_id = o.opera_id WHERE LOWER(REPLACE(o.opera_name, ' ', '-')) = $1 AND p.price_id = $2`;
    try {
        const { rows: prices } = await pool.query(sqlQuery, [operaName, priceID]);
        const { rows: multipliers } = await pool.query('select name,multiplier from lv');
        if (prices.length > 0) {
            return res.json({ status: true, prices: prices[0], multipliers: multipliers });
        } else {
            return res.json({ status: false, msg: 'price not found' });
        }
    } catch (error) {
        console.log(error);
        return res.json({ status: false, msg: 'unknown fatal error' });
    }
});

app.post('/refundOrder', async (req, res) => {
    const { user, order_id } = req.body;
    try {
        await pool.query('BEGIN');
        const orderRes = await pool.query(
            `SELECT o.order_id, o.uid, o.sum_fee, o.transac_status
             FROM orders o
             JOIN user_infor u ON o.uid = u.uid
             WHERE o.order_id = $1 AND u.id = $2
             FOR UPDATE`,
            [order_id, user]
        );
        if (orderRes.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.json({ msg: 'not_found' });
        }
        const order = orderRes.rows[0];
        if (order.transac_status !== 'COMPLETED') {
            await pool.query('ROLLBACK');
            return res.json({ msg: 'not_refundable' });
        }
        const refundAmount = parseFloat(order.sum_fee);
        const walletRes = await pool.query(
            'UPDATE wallet SET balance = balance + $1, updated_at = NOW() WHERE uid = $2 RETURNING balance',
            [refundAmount, order.uid]
        );
        const newBalance = parseFloat(walletRes.rows[0].balance);
        const txId = utils.generate_TransacID();
        await pool.query(
            `INSERT INTO wallet_transaction (tx_id, uid, order_id, tx_type, amount, running_balance, source_destination, description)
             VALUES ($1, $2, $3, 'CREDIT', $4, $5, 'ORDER_REFUND', $6)`,
            [txId, order.uid, order_id, refundAmount, newBalance, `Refund for order #${order_id}`]
        );
        await pool.query(
            `UPDATE orders SET transac_status = 'REFUNDED' WHERE order_id = $1`,
            [order_id]
        );
        const infoRes = await pool.query(
            `SELECT u.email, op.opera_name
             FROM user_infor u, ticket t
             JOIN opera op ON op.opera_id = t.opera_id
             WHERE u.id = $1 AND t.order_id = $2
             LIMIT 1`,
            [user, order_id]
        );
        await pool.query('COMMIT');
        if (infoRes.rows.length > 0 && infoRes.rows[0].email) {
            try {
                await utils.send_refund_email(infoRes.rows[0].email, order_id, infoRes.rows[0].opera_name, refundAmount);
            } catch (mailErr) {
                console.error('refund email failed but refund succeeded:', mailErr);
            }
        }
        return res.json({ msg: 'success', balance: newBalance });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Refund Error:', error);
        return res.json({ msg: 'error' });
    }
});

app.post('/SendConfirmationEmail', async (req, res) => {
    const { user, orderId, opera, showtime, level, sum_price, tickets } = req.body;
    try {
        const { rows } = await pool.query('select email from user_infor where id=$1', [user]);
        if (rows.length > 0 && rows[0].email) {
            const email = rows[0].email;
            await utils.send_confirmation_email(email, orderId, opera, showtime, level, sum_price, tickets);
            return res.json({ msg: 'success' });
        } else {
            return res.json({ msg: 'email_not_found' });
        }
    } catch (error) {
        console.error('Send Email Error:', error);
        return res.json({ msg: 'error' });
    }
});

app.post('/toolkit/gen_redeem_code', async (req, res) => {
    const code = req.body.code;
    const value = req.body.value;
    try {
        await pool.query('insert into gift_code(code,amount) values($1,$2)', [code, value]);
        return res.json({ msg: 'success' });
    } catch (error) {
        console.log(error);
        return res.json({ msg: 'fail' });
    }
});



export default app; 