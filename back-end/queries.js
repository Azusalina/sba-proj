// this is a file to store sql queries being used in backend server

//serv-auth.js
//abbr: ev=email verification

const signup_FetchUserID = `select id from user_infor where id=$1`;
const signup_CreateNew_Account = `insert into user_infor(id,email,pwd,salt) values($1,$2,$3,$4)`
const signup_CreateNew_ev = `INSERT INTO email_verification(token, userid, expire_time) VALUES($1, $2, NOW() + INTERVAL '1 day')`
const signup_CreateNew_Wallet = `INSERT INTO wallet(uid, balance) SELECT uid, 0.00 FROM user_infor WHERE id = $1 ON CONFLICT(uid) DO NOTHING`

const token_fetch = `SELECT userid FROM email_verification WHERE token = $1 AND expire_time > NOW() AND used = FALSE`
const token_update_user = `UPDATE user_infor SET verified=TRUE WHERE id=$1`
const token_update_ev = `UPDATE email_verification SET used=TRUE WHERE token=$1 and used=FALSE`

const signin_fetchpwd = `select pwd,salt,verified from user_infor where id=$1`

const reset_check_exists = `SELECT EXISTS(SELECT 1 FROM user_infor WHERE email=$1)`
const reset_select_email = `SELECT email FROM pwd_reset WHERE token = $1 AND expire_time > NOW() AND used = FALSE FOR UPDATE`
const reset_pwd = `UPDATE user_infor SET pwd = $1, salt = $2 WHERE email = $3`
const reset_status = `UPDATE pwd_reset SET used = TRUE WHERE token = $1`


export const authsql = {
    signup_FetchUserID,
    signup_CreateNew_Account,
    signup_CreateNew_ev,
    token_fetch,
    token_update_user,
    token_update_ev,
    signup_CreateNew_Wallet,
    signin_fetchpwd,
    reset_check_exists,
    reset_select_email,
    reset_pwd,
    reset_status
}



//serv-main.js

const GetData = `select u.uid,u.id,u.create_at,u.email,u.birth,w.balance from user_infor u left join wallet w on u.uid=w.uid where u.id=$1`
const GetUserOrder = `SELECT o.order_id, o.book_time, o.transac_time, o.transac_method, o.sum_fee, o.transac_status, (SELECT op.opera_name FROM ticket t JOIN opera op ON op.opera_id = t.opera_id WHERE t.order_id = o.order_id LIMIT 1) AS opera_name, (SELECT json_agg(json_build_object('seat_class', grp.seat_class, 'seat_class2', grp.seat_class2, 'count', grp.cnt)) FROM (SELECT seat_class, seat_class2, COUNT(*) AS cnt FROM ticket WHERE order_id = o.order_id GROUP BY seat_class, seat_class2) grp) AS ticket_breakdown FROM orders o JOIN user_infor u ON o.uid = u.uid WHERE u.id = $1 ORDER BY o.book_time DESC`;

const refund_selectOrder = `SELECT o.order_id, o.uid, o.sum_fee, o.transac_status FROM orders o JOIN user_infor u ON o.uid = u.uid WHERE o.order_id = $1 AND u.id = $2 FOR UPDATE`;
const refund_updateWallet = `UPDATE wallet SET balance = balance + $1, updated_at = NOW() WHERE uid = $2 RETURNING balance`;
const refund_RecordRefund = `INSERT INTO wallet_transaction (tx_id, uid, order_id, tx_type, amount, running_balance, source_destination, description) VALUES ($1, $2, $3, 'CREDIT', $4, $5, 'ORDER_REFUND', $6)`
const refund_updateStatus = `UPDATE orders SET transac_status = 'REFUNDED' WHERE order_id = $1`
const refund_getEmailContent = `SELECT u.email, op.opera_name FROM user_infor u, ticket t JOIN opera op ON op.opera_id = t.opera_id WHERE u.id = $1 AND t.order_id = $2 LIMIT 1`

const redeem_fetchCode = `select * from gift_code where code=$1 for update`
const redeem_updateWallet = `UPDATE wallet SET balance = balance + $1 WHERE uid = (SELECT uid FROM user_infor WHERE id = $2) returning balance`
const redeem_updateStatus = `update gift_code set current_status=true,claim_by=$1,claim_time=now() where code=$2`

const update_fetch = `SELECT o.opera_id, o.opera_name, o.duration, o.rate, p.price_id, p.budget, p.time AS showtime FROM opera o LEFT JOIN prices p ON o.opera_id = p.opera_id ORDER BY o.opera_id, p.price_id;`
const Getprices = `SELECT premium, std_high, std_low, budget FROM prices p LEFT JOIN opera o ON p.opera_id = o.opera_id WHERE LOWER(REPLACE(o.opera_name, ' ', '-')) = $1 AND p.price_id = $2`

const pay_fetchUser = `SELECT u.uid, w.balance FROM user_infor u JOIN wallet w ON u.uid = w.uid WHERE u.id = $1`
const pay_record_order = `INSERT INTO orders (uid, book_time, transac_time, transac_method, sum_fee, transac_status) VALUES ($1, NOW(), NOW(), 'WALLET_BALANCE', $2, 'COMPLETED') RETURNING order_id`
const pay_updateWallet = `UPDATE wallet SET balance = balance - $1, updated_at = NOW() WHERE uid = $2 RETURNING balance`
const pay_record_tx = `INSERT INTO wallet_transaction (tx_id, uid, order_id, tx_type, amount, running_balance, source_destination, description) VALUES ($1, $2, $3, 'DEBIT', $4, $5, 'OPERA_TICKET_PURCHASE', $6)`
const pay_fetchOpera = `SELECT opera_id FROM opera WHERE LOWER(REPLACE(opera_name, ' ', '-')) = $1`
const pay_record_ticket = `INSERT INTO ticket (ticket_id, opera_id, order_id, seat_class, seat_class2, seat_num) VALUES ($1, $2, $3, $4, $5, $6)`
const pay_fetchEmail = `select email from user_infor where id=$1`

const admin_generateCode = `insert into gift_code(code,amount) values($1,$2)`


//newly added seat part
const lv_multipliers=`select name,multiplier from lv`
const seat_session = `select p.pid, p.time, o.opera_id, o.opera_name, p.premium, p.std_high, p.std_low, p.budget from prices p join opera o on o.opera_id = p.opera_id where lower(replace(o.opera_name, ' ', '-')) = $1 and p.price_id = $2`
const seat_all = `select seat_id, row_label, col_no, zone, is_accessible from seat order by row_label, col_no`
const seat_takenList = `select seat_id from ticket where pid = $1 and voided_at is null`
const seat_blockedList = `select seat_id from seat_block where pid = $1`
const seat_lock = `select seat_id, row_label, col_no, zone, is_accessible from seat where seat_id = any($1::int[]) order by seat_id for update`
const seat_checkTaken = `select seat_id from ticket where pid = $1 and seat_id = any($2::int[]) and voided_at is null`
const seat_checkBlocked = `select seat_id from seat_block where pid = $1 and seat_id = any($2::int[])`
const pay_record_seatTicket = `insert into ticket (ticket_id, opera_id, order_id, pid, seat_id, seat_class, seat_class2, seat_num, unit_price) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
const refund_voidTickets = `update ticket set voided_at = now() where order_id = $1 and voided_at is null`

//admin-seat part

const admin_sessions = `select p.pid, o.opera_name, p.price_id, p.time, (select count(*) from seat) as total, (select count(*) from ticket t where t.pid = p.pid and t.voided_at is null) as booked, (select count(*) from seat_block b where b.pid = p.pid) as blocked from prices p join opera o on o.opera_id = p.opera_id order by o.opera_name, p.time`;
const admin_sessionInfo = `select p.pid, o.opera_name, p.price_id, p.time from prices p join opera o on o.opera_id = p.opera_id where p.pid = $1`
const admin_seatStatus = `select s.seat_id, s.row_label, s.col_no, s.zone, s.is_accessible, case when t.ticket_id id not null then 'booked' when b.seat_id is not null then 'blocked' else 'idle' end as state, t.ticket_id, t.order_id. t.seat_class2 as audience. t.unit_price, u.id as username, o.book_time, b.reason, b.blocked_at from seat s left join ticket t on t.seat_id = s.seat_id and t.pid = $1 and t.voided_at is null left join seat_block b on b.seat_id = s.seat_id and b.pid = #1 left join orders o on o.order_id = t.order_id left joni user_infor u on u.uid = o.uid order by s.row_label, s.col_no`
//impressive.
const admin_refundedCount = `select count(*) as n from ticket where pid = $1 and voided_at is not null`
const admin_blockInsert = `insert into seat_block (pid, seat_id, reason) select $1::int, unnest($2::int[]), $3::varchar on conflict do nothing`
const admin_blockDelete = `delete from seat_block where pid = $1 and seat_id = any($2::int[])`



export const mainsql = {
    GetData,
    GetUserOrder,
    refund_selectOrder,
    refund_updateWallet,
    refund_RecordRefund,
    refund_updateStatus,
    refund_getEmailContent,
    redeem_fetchCode,
    redeem_updateWallet,
    redeem_updateStatus,
    update_fetch,
    Getprices,
    pay_fetchUser,
    pay_record_order,
    pay_updateWallet,
    pay_record_tx,
    pay_fetchOpera,
    pay_record_ticket,
    pay_fetchEmail,
    admin_generateCode,
    lv_multipliers,
    seat_session,
    seat_all,
    seat_takenList,
    seat_blockedList,
    seat_lock,
    seat_checkTaken,
    seat_checkBlocked,
    pay_record_seatTicket,
    refund_voidTickets
}

export const adminsql = {
    admin_sessions,
    admin_sessionInfo,
    admin_seatStatus,
    admin_refundedCount,
    admin_blockInsert,
    admin_blockDelete
}
//serv-util.js
//abbr sre=send_reset_email

const sre_record = `INSERT INTO pwd_reset(email, token, expire_time, used) VALUES($1, $2, NOW() + INTERVAL '15 minutes', false)`


export const utilsql = { sre_record }