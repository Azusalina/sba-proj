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
    const op_name = req.body?.name;
    const planID = utils.getPricePlan(); 
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

app.post('/operaName', async (req, res) => {
    const operaName = req.body.name;
    const priceID = utils.getPricePlan(); 
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

app.post('/PaymentOrder', async (req, res) => {
    const { user, opera, level, sum_price, adult, student, wheelchair } = req.body;
    const payAmount = parseFloat(sum_price);
    try {
        await pool.query('BEGIN');
        const userRes = await pool.query('SELECT u.uid, w.balance FROM user_infor u JOIN wallet w ON u.uid = w.uid WHERE u.id = $1', [user]);
        if (userRes.rows.length === 0) throw new Error('User or wallet not found');

        const { uid, balance } = userRes.rows[0];
        const currentBalance = parseFloat(balance);
        if (currentBalance < payAmount) {
            await pool.query('ROLLBACK');
            return res.json({ msg: 'insufficientBalance' });
        }

        const orderRes = await pool.query("INSERT INTO orders (uid, book_time, transac_time, transac_method, sum_fee, transac_status) VALUES ($1, NOW(), NOW(), 'WALLET_BALANCE', $2, 'COMPLETED') RETURNING order_id", [uid, payAmount]);
        const newOrderId = orderRes.rows[0].order_id;

        const walletRes = await pool.query('UPDATE wallet SET balance = balance - $1, updated_at = NOW() WHERE uid = $2 RETURNING balance', [payAmount, uid]);
        const newWalletBal = parseFloat(walletRes.rows[0].balance);

        const txId = utils.generate_TransacID(); 
        await pool.query("INSERT INTO wallet_transaction (tx_id, uid, order_id, tx_type, amount, running_balance, source_destination, description) VALUES ($1, $2, $3, 'DEBIT', $4, $5, 'OPERA_TICKET_PURCHASE', $6)", [txId, uid, newOrderId, payAmount, newWalletBal, `Purchased ticket for ${opera}`]);

        const operaRes = await pool.query('SELECT opera_id FROM opera WHERE opera_name = $1', [opera]);
        if (operaRes.rows.length === 0) throw new Error('Opera not found');
        const operaId = operaRes.rows[0].opera_id;

        const generatedTicketIDs = [];
        const insertTickets = async (seatClass2, quantity) => {
            for (let i = 0; i < quantity; i++) {
                const ticketId = utils.generate_ticketID(opera); 
                generatedTicketIDs.push({ ticketId, level, seatClass2 });
                await pool.query('INSERT INTO ticket (ticket_id, opera_id, order_id, seat_class, seat_class2, seat_num) VALUES ($1, $2, $3, $4, $5, 1)', [ticketId, operaId, newOrderId, level, seatClass2]);
            }
        };

        if (adult > 0) await insertTickets('ADULT', adult);
        if (student > 0) await insertTickets('STUDENT', student);
        if (wheelchair > 0) await insertTickets('WHEELCHAIR', wheelchair);

        await pool.query('COMMIT');
        return res.json({ msg: 'success', orderId: newOrderId, tickets: generatedTicketIDs });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Transaction Error:', error);
        return res.json({ msg: 'error', details: 'service in maintainance' });
    }
});

app.post('/SendConfirmationEmail', async (req, res) => {
    const { user, orderId, opera, level, sum_price, tickets } = req.body;
    try {
        const { rows } = await pool.query('select email from user_infor where id=$1', [user]);
        if (rows.length > 0 && rows[0].email) {
            const email = rows[0].email;
            await utils.send_confirmation_email(email, orderId, opera, level, sum_price, tickets);
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