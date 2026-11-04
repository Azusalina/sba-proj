// this is a file to store sql queries being used in backend server

//auth part
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