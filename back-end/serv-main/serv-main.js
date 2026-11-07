import express from 'express';
import cors from 'cors';

import pool from '../serv-config/serv-config.js';
import * as utils from '../serv-utils/serv-utils.js';
import { Recipient } from "mailersend";

import { Queue } from '../serv-utils/ticket-queue.mjs'
import { mainsql } from '../queries.js'

const app = express();
app.use(cors());
app.use(express.json());

app.post('/settingGetData', async (req, res) => {
    const username = req.body.username;
    try {
        const { rows } = await pool.query(mainsql.GetData, [username]);
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
        const { rows } = await pool.query(mainsql.GetUserOrder, [username]);
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
        const orderRes = await pool.query(mainsql.refund_selectOrder, [order_id, user]
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
        const walletRes = await pool.query(mainsql.refund_updateWallet, [refundAmount, order.uid]);
        const newBalance = parseFloat(walletRes.rows[0].balance);
        const txId = utils.generate_TransacID();
        await pool.query(mainsql.refund_RecordRefund, [txId, order.uid, order_id, refundAmount, newBalance, `Refund for order #${order_id}`]);
        await pool.query(mainsql.refund_updateStatus, [order_id]);
        const infoRes = await pool.query(mainsql.refund_getEmailContent, [user, order_id]);
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
        const { rows } = await pool.query(mainsql.redeem_fetchCode, [code]);

        if (rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.json({ msg: 'invalid' });
        }
        if (rows[0].current_status === true) {
            await pool.query('ROLLBACK');
            return res.json({ msg: 'already redeemed' });
        }
        const amount = rows[0].amount;
        const walletResult = await pool.query(mainsql.redeem_updateWallet, [amount, user]);
        if (walletResult.rowCount === 0) {
            await pool.query('ROLLBACK');
            return res.json({ msg: 'unknown fatal error' });
        }
        await pool.query(mainsql.redeem_updateStatus, [user, code]);
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
        const { rows } = await pool.query(mainsql.update_fetch);
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
    const { name: operaName, priceId } = req.body;
    if (!operaName || !Number.isInteger(Number(priceId))) {
        return res.status(400).json({
            status: false,
            msg: 'Invalid opera|| price plan'
        });
    }
    try {
        const { rows: prices } = await pool.query(mainsql.Getprices, [operaName, Number(priceId)]);
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

    const quantities = [adult, student, wheelchair].map(Number);

    if (
        quantities.some(value =>
            !Number.isInteger(value) || value < 0
        ) ||
        quantities.every(value => value === 0)
    ) {
        return res.status(400).json({ msg: 'invalid_quantity' });
    }

    if (!Number.isFinite(payAmount) || payAmount <= 0) {
        return res.status(400).json({ msg: 'invalid_amount' });
    }
    try {
        await pool.query('BEGIN');
        const userRes = await pool.query(mainsql.pay_fetchUser, [user]);
        if (userRes.rows.length === 0) throw new Error('User or wallet not found');

        const { uid, balance } = userRes.rows[0];
        const currentBalance = parseFloat(balance);
        if (currentBalance < payAmount) {
            await pool.query('ROLLBACK');
            return res.json({ msg: 'insufficientBalance' });
        }

        const orderRes = await pool.query(mainsql.pay_record_order, [uid, payAmount]);
        const newOrderId = orderRes.rows[0].order_id;

        const walletRes = await pool.query(mainsql.pay_updateWallet, [payAmount, uid]);
        const newWalletBal = parseFloat(walletRes.rows[0].balance);

        const txId = utils.generate_TransacID();
        await pool.query(mainsql.pay_record_tx, [txId, uid, newOrderId, payAmount, newWalletBal, `Purchased ticket for ${opera}`]);

        const operaRes = await pool.query(mainsql.pay_fetchOpera, [opera]);
        if (operaRes.rows.length === 0) throw new Error('Opera not found');
        const operaId = operaRes.rows[0].opera_id;

        const generatedTicketIDs = [];
        const ticketQueue = new Queue();

        const enqueueTickets = (seatClass2, quantity) => {
            for (let i = 0; i < quantity; i++) {
                ticketQueue.enqueue(seatClass2);
            }
        };

        enqueueTickets('ADULT', adult);
        enqueueTickets('STUDENT', student);
        enqueueTickets('WHEELCHAIR', wheelchair);

        while (!ticketQueue.isEmpty()) {
            const seatClass2 = ticketQueue.dequeue();
            const ticketId = utils.generate_ticketID(opera);

            generatedTicketIDs.push({ ticketId, level, seatClass2 });
            await pool.query(mainsql.pay_record_ticket, [ticketId, operaId, newOrderId, level, seatClass2, generatedTicketIDs.length]);
        }
        await pool.query('COMMIT');
        return res.json({ msg: 'success', orderId: newOrderId, tickets: generatedTicketIDs });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Transaction Error:', error);
        return res.json({ msg: 'error', details: 'service in maintainance' });
    }
});
app.post('/SendConfirmationEmail', async (req, res) => {
    const { user, orderId, opera, showtime, level, sum_price, tickets } = req.body;
    try {
        const { rows } = await pool.query(mainsql.pay_fetchEmail, [user]);
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
        await pool.query(mainsql.admin_generateCode, [code, value]);
        return res.json({ msg: 'success' });
    } catch (error) {
        console.log(error);
        return res.json({ msg: 'fail' });
    }
});



export default app; 
