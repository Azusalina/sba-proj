import express from 'express';
import cors from 'cors';

import pool from '../serv-config/serv-config.js';
import * as utils from '../serv-utils/serv-utils.js';
import { Recipient } from "mailersend";

import { Queue } from '../serv-utils/ticket-queue.mjs'
import { mainsql, adminsql } from '../queries.js'
import { SmsNumberModule } from 'mailersend/lib/modules/sms/Number.module.js';

const MAX_SEATS = 8;
const AUDIENCES = ['adult', 'student', 'wheelchair']
const round2 = (n) => Math.round(n * 100) / 100;

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
    const client = await pool.connect();
    try {
        await client.query('begin');
        const orderRes = await client.query(mainsql.refund_selectOrder, [order_id, user]);
        if (orderRes.rows.length === 0) {
            await client.query('rollback');
            console.error(`refundOrder: not found`);
            return res.json({ msg: 'not_found' });
        }
        const order = orderRes.rows[0];
        if (order.transac_status !== 'COMPLETED') {
            await client.query('rollback');
            console.error("refundOrder: not refundable");
            return res.json({ msg: 'not_refundable' });
        }
        const refundAmount = parseFloat(order.sum_fee);
        const walletRes = await client.query(mainsql.refund_updateWallet, [refundAmount, order.uid]);
        const newBalance = parseFloat(walletRes.rows[0].balance);
        const txId = utils.generate_TransacID();
        await client.query(mainsql.refund_updateStatus, [order_id]);
        await client.query(mainsql.refund_voidTickets, [order_id]);
        await client.query(mainsql.refund_RecordRefund, [txId, order.uid, order_id, refundAmount, newBalance, `Refund for order #${order_id}`]);
        const infoRes = await client.query(mainsql.refund_getEmailContent, [user, order_id]);
        await client.query(`commit`);
        if (infoRes.rows.length > 0 && infoRes.rows[0].email) {
            try {
                await utils.send_refund_email(infoRes.rows[0].email, order_id, infoRes.rows[0].opera_name, refundAmount);
            } catch (mailErr) {
                console.error('refund:email filaed but refund suceeded', mailErr)
            }
        }
        return res.json({ msg: 'success', balance: newBalance });
    } catch (error) {
        try { await client.query('rollback'); } catch (_) { }
        console.error("refund: error", error);
        return res.json({ msg: 'error' })
    } finally {
        client.release();
    }
})
app.post('/redeem', async (req, res) => {
    const user = req.body.user;
    const code = req.body.code;
    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');
        const { rows } = await client.query(mainsql.redeem_fetchCode, [code]);

        if (rows.length === 0) {
            await client.query('ROLLBACK');
            return res.json({ msg: 'invalid' });
        }
        if (rows[0].current_status === true) {
            await client.query('ROLLBACK');
            return res.json({ msg: 'already redeemed' });
        }
        const amount = rows[0].amount;
        const walletResult = await client.query(mainsql.redeem_updateWallet, [amount, user]);
        if (walletResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.json({ msg: 'unknown fatal error' });
        }
        await client.query(mainsql.redeem_updateStatus, [user, code]);
        await client.query('COMMIT');
        const balance = walletResult.rows[0].balance;
        return res.json({ msg: 'redeemed', balance: balance });
    } catch (error) {
        if (client) { try { await client.query('ROLLBACK'); } catch (_) { } }
        console.log(error);
        return res.json({ msg: 'unknown fatal error' });
    } finally {
        if (client) client.release();
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
    const { user, opera, priceId, seats } = req.body;

    if (!user || !opera || !Number.isInteger(Number(priceId)) || !Array.isArray(seats) || seats.length < 1 || seats.length > MAX_SEATS) {
        console.error('paymentOrder:invalid_request');
        return res.status(400).json({ msg: 'invalid_request' });
    }
    if (seats.some(seat => !seat || typeof seat !== 'object')) {
        console.error('paymentError:invalid_seats')
        return res.status(400).json({ msg: 'invalid_seats' })
    }
    const ids = seats.map(seat => Number(seat.seat_id));
    if (ids.some(id => !Number.isInteger(id)) || new Set(ids).size !== ids.length || seats.some(seat => !AUDIENCES.includes(seat.audience))) {
        console.error('paymentOrder:invalid_seats');
        return res.status(400).json({ msg: 'invalid_seats' });
    }

    let client;
    try {
        client = await pool.connect();
        await client.query('begin');

        const showRes = await client.query(mainsql.seat_session, [opera, Number(priceId)]);
        if (showRes.rows.length === 0) {
            await client.query('rollback');
            return res.status(400).json({ msg: 'show_not_found' });
        }
        const show = showRes.rows[0];

        const locked = (await client.query(mainsql.seat_lock, [ids])).rows;
        if (locked.length !== ids.length) {
            await client.query('rollback');
            return res.status(400).json({ msg: 'invalid_seats' });
        }
        const taken = (await client.query(mainsql.seat_checkTaken, [show.pid, ids])).rows;
        if (taken.length > 0) {
            await client.query('rollback');
            console.error('paymentOrder:seat_taken');
            return res.status(409).json({ msg: 'seat_taken', seats: taken.map(r => r.seat_id) });
        }
        const blocked = (await client.query(mainsql.seat_checkBlocked, [show.pid, ids])).rows;
        if (blocked.length > 0) {
            await client.query('rollback');
            console.error('paymentOrder:seat_blocked');
            return res.status(409).json({ msg: 'seat_blocked', seats: blocked.map(r => r.seat_id) });
        }

        const multiplier = {};
        (await client.query(mainsql.lv_multipliers)).rows.forEach(row => { multiplier[row.name] = Number(row.multiplier); });
        const seatById = new Map(locked.map(seat => [seat.seat_id, seat]));
        const items = seats.map(choice => {
            const seat = seatById.get(Number(choice.seat_id));
            const base = Number(show[seat.zone]);
            if (!Number.isFinite(base)) throw new Error('zone price missing');
            return { seat, audience: choice.audience, unit: round2(base * (multiplier[choice.audience] ?? 1)) };
        });
        if (items.some(item => item.audience === 'wheelchair' && !item.seat.is_accessible)) {
            await client.query('rollback');
            return res.status(400).json({ msg: 'wheelchair_needs_accessible_seat' });
        }
        const payAmount = round2(items.reduce((sum, item) => sum + item.unit, 0));

        const userRes = await client.query(mainsql.pay_fetchUser, [user]);
        if (userRes.rows.length === 0) throw new Error('user or wallet not found');
        const { uid, balance } = userRes.rows[0];
        if (parseFloat(balance) < payAmount) {
            await client.query('rollback');
            console.error("paymentOrder:insufficient wallet balance");
            return res.json({ msg: 'insufficientBalance' });
        }

        const orderRes = await client.query(mainsql.pay_record_order, [uid, payAmount]);
        const newOrderId = orderRes.rows[0].order_id;
        const walletRes = await client.query(mainsql.pay_updateWallet, [payAmount, uid]);
        const newWalletBal = parseFloat(walletRes.rows[0].balance);
        const txId = utils.generate_TransacID();
        await client.query(mainsql.pay_record_tx, [txId, uid, newOrderId, payAmount, newWalletBal, `Purchased ${items.length} seat(s) for ${show.opera_name}`]);


        const ticketQueue = new Queue();
        items.forEach(item => ticketQueue.enqueue(item));

        const generatedTickets = [];
        while (!ticketQueue.isEmpty()) {
            const item = ticketQueue.dequeue();
            const ticketId = utils.generate_ticketID();
            const seatClass2 = item.audience.toUpperCase();
            await client.query(mainsql.pay_record_seatTicket, [ticketId, show.opera_id, newOrderId, show.pid, item.seat.seat_id, item.seat.zone, seatClass2, generatedTickets.length + 1, item.unit]);

            generatedTickets.push({
                ticketId,
                level: item.seat.zone,
                seatClass2,
                seat: `${item.seat.row_label}${item.seat.col_no}`,
                unitPrice: item.unit
            });
        }
        await client.query('commit');
        return res.json({ msg: 'success', orderId: newOrderId, tickets: generatedTickets, total: payAmount });
    } catch (error) {
        if (client) { try { await client.query('rollback'); } catch (_) { } }
        console.error("tx error", error);
        return res.json({ msg: 'error', details: 'service in maintenance' });
    } finally {
        if (client) client.release();
    }

})
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
app.post('/seatMap', async (req, res) => {
    const { name, priceId } = req.body;
    if (!name || !Number.isInteger(Number(priceId))) {
        return res.status(400).json({ status: false, msg: 'invalid request' })
    }
    try {
        const { rows: sessions } = await pool.query(mainsql.seat_session, [name, Number(priceId)]);
        if (sessions.length === 0) {
            return res.json({ status: false, msg: 'show not found' });
        }
        const show = sessions[0];
        const { rows: seats } = await pool.query(mainsql.seat_all);
        const taken = new Set((await pool.query(mainsql.seat_takenList, [show.pid])).rows.map(r => r.seat_id));
        const blocked = new Set((await pool.query(mainsql.seat_blockedList, [show.pid])).rows.map(r => r.seat_id));
        const { rows: multipliers } = await pool.query(mainsql.lv_multipliers);

        return res.json({
            status: true,
            pid: show.pid,
            time: show.time,
            prices: {
                premium: show.premium,
                std_high: show.std_high,
                std_low: show.std_low,
                budget: show.budget
            },
            multipliers: multipliers,
            seats: seats.map(seat => ({
                seat_id: seat.seat_id,
                row: seat.row_label,
                col: seat.col_no,
                zone: seat.zone,
                accessible: seat.is_accessible,
                state: taken.has(seat.seat_id) ? 'booked' : blocked.has(seat.seat_id) ? 'blocked' : 'idle'
            }))
        });
    } catch (error) {
        console.error(error);
        return res.json({ status: false, msg: 'unknown fatal error' })
    }
})
app.post('/toolkit/sessions', async (req, res) => {
    try {
        const { rows } = await pool.query(adminsql.admin_sessions);
        return res.json({
            status: true,
            sessions: rows.map(row => ({
                pid: row.pid,
                opera: row.opera_name,
                planId: row.price_id,
                time: row.time,
                total: Number(row.total),
                booked: Number(row.booked),
                blocked: Number(row.blocked)
            }))
        })
    } catch (error) {
        console.error(error);
        return res.json({ status: false, sessions: [] })
    }
})
app.post('./toolkit/seat_status', async (req, res) => {
    const pid = Number(req.body.pid);
    if (!Number.isInteger(pid)) {
        return res.status(400).json({ status: false, msg: 'invalid_pid' });
    }
    try {
        const info = (await pool.query(adminsql.admin_sessionInfo, [pid])).rows[0];
        if (!info) {
            return res.json({ status: false, msg: 'show not exist' });
        }
        const { rows } = await pool.query(adminsql.admin_seatStatus, [pid]);
        const refunded = Number((await pool.query(adminsql.admin_refundedCount, [pid])).rows[0].n);

        const summary = { total: rows.length, idle: 0, booked: 0, blocked: 0, revenue: 0, refunded, byZone: {} }
        rows.forEach(row => {
            summary[row.state] += 1;
            if (row.state === 'booked') summary.revenue += Number(row.unit_price);
            if (!summary.byZone[row.zone]) summary.byZone[row.zone] = { idle: 0, booked: 0, blocked: 0 };
            summary.byZone[row.zone][row.state] += 1;
            //where an implementation of2d array is performed
        });
        summary.revenue = round2(summary.revenue);


        return res.json({
            status: true,
            session: { pid: info.pid, opera: info.opera_name, planId: info.price_id, time: info.time },
            summary: summary,
            seats: rows.map(row => ({
                seat_id: row.seat_id,
                row: row.row_label,
                col: row.col_no,
                zone: row.zone,
                accessible: row.is_accessible,
                state: row.state,
                ticket_id: row.ticket_id,
                order_id: row.order_id,
                audience: row.audience,
                unit_price: row.unit_price,
                username: row.username,
                book_time: row.book_time,
                reason: row.reason,
                blocked_at: row.blocked_at
            }))
        });
    } catch (error) {
        console.error(error);
        return res.json({ status: false, msg: 'sth went wrong and we dunno.' });
    }
});
app.post('./toolkit/seat_block', async (req, res) => {
    const { pid, seat_ids, action, reason } = req.body;
    const ids = Array.isArray(seat_ids) ? seat_ids.map(Number) : [];
    if (!Number.isInteger(Number(pid)) || ids.length === 0 || ids.some(id => !Number.isInteger(id)) || !['block', 'unblock'].includes(action)) {
        return res.status(400).json({ status: false, msg: 'invalid data input' });
    }
    let client;
    try {
        client = await pool.connect();
        await client.query('begin');
        const info = (await client.query(adminsql.admin_sessionInfo, [Number(pid)])).rows[0];
        const locked = (await client.query(adminsql.seat_lock, [ids])).rows;
        if (!info || locked.length !== ids.length) {
            await client.query('rollback');
            return res.status(400).json({ msg: 'invalid-request' });
        }
        if (action === 'block') {
            const taken = (await client.query(adminsql.seat_checkTaken, [Number(pid), ids])).rows;
            if (taken.length > 0) {
                await client.query('rollback');
                return res.status(400).json({ msg: 'seat_booked', seats: taken.map(a => a.seat_id) });
            }
            await client.query(adminsql.admin_blockInsert, [Number(pid), ids, String(reason || '').slice(0, 100) || null]);
        } else {
            await client.query(adminsql.admin_blockDelete, [Number(pid), ids]);
        }
        await client.query('commit');
        return res.json({ msg: 'success' })
    } catch (error) {
        if (client) { try { await client.query('rollback') } catch (_) { } }
        console.error(error);
        return res.json({ status: false, msg: 'sth bad happen and we dont know.' });
    } finally {
        if (client) client.release();
    }
})







export default app; 
