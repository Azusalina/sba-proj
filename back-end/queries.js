// this is a file to store sql queries being used in backend server

//serv-auth.js part
//abbr: ev=email verification
//unless specified , `token` stand for auth/:token queries

const signup_FetchUserID = `select id from user_infor where id=$1`;
const signup_CreateNew_Account = `insert into user_infor(id,email,pwd,salt) values($1,$2,$3,$4)`
const signup_CreateNew_ev = `INSERT INTO email_verification(token, userid, expire_time) VALUES($1, $2, NOW() + INTERVAL '1 day')`

const token_fetch = `SELECT userid FROM email_verification WHERE token = $1 AND expire_time > NOW() AND used = FALSE`
const token_update_user = `UPDATE user_infor SET verified=TRUE WHERE id=$1`
const token_update_ev = `UPDATE email_verification SET used=TRUE WHERE token=$1 and used=FALSE`
const signup_CreateNew_Wallet = `INSERT INTO wallet(uid, balance) SELECT uid, 0.00 FROM user_infor WHERE id = $1 ON CONFLICT(uid) DO NOTHING`

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
const GetUserOrder = `SELECT o.order_id, o.book_time, o.transac_time, o.transac_method, o.sum_fee, o.transac_status,
                     (SELECT op.opera_name FROM ticket t JOIN opera op ON op.opera_id = t.opera_id WHERE t.order_id = o.order_id LIMIT 1) AS opera_name,
                     (SELECT json_agg(json_build_object('seat_class', grp.seat_class, 'seat_class2', grp.seat_class2, 'count', grp.cnt))
                     FROM (SELECT seat_class, seat_class2, COUNT(*) AS cnt FROM ticket WHERE order_id = o.order_id GROUP BY seat_class, seat_class2) grp) AS ticket_breakdown
                        FROM orders o
                        JOIN user_infor u ON o.uid = u.uid
                        WHERE u.id = $1
                        ORDER BY o.book_time DESC`;

const refund_selectOrder = `SELECT o.order_id, o.uid, o.sum_fee, o.transac_status
             FROM orders o
             JOIN user_infor u ON o.uid = u.uid
             WHERE o.order_id = $1 AND u.id = $2
             FOR UPDATE`;

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
    admin_generateCode
}