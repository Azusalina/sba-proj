const isLocal = window.location.hostname === '127.0.0.1'
const API_BASE_URL = isLocal ? 'http://127.0.0.1:3000' : 'https://backend-sba.vercel.app';



const stage = document.getElementById("stage");
const to_signin_switch = document.getElementById("to_signin_redirection");
const to_signup_switch = document.getElementById("to_signup_redirection");
to_signup_switch.onclick = function () { stage.classList.add('swipe'); }
to_signin_switch.onclick = function () { stage.classList.remove('swipe'); }

///////
const signin_name = document.getElementById("signin_name");
const signin_pwd = document.getElementById("signin_pwd");
const singin_btn = document.getElementById("signin_btn");
const signin_status = document.getElementById("signin_status");

let username = "";
let pwd = "";

//
const signup_id = document.getElementById("signup_id");
const signup_email = document.getElementById("signup_email");
const signup_pwd = document.getElementById("signup_pwd");
const signup_pwd_confirm = document.getElementById("signup_pwd_confirm");
const signup_status = document.getElementById("signup_status");
const signupSubmit = document.getElementById("signupform");

const to_reset_btn = document.getElementById("to_reset_redirection")




//sub-funcs
async function signin(username, pwd) {
    const url = `${API_BASE_URL}/auth/login`;
    const data = { user_name: username, passwd: pwd };
    try {

        const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await resp.json();

        if (result.success) {
            signin_status.innerText = result.msg;
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user', username);
            window.location.href = '../index.html';
        } else {
            signin_status.innerText = 'pwd incorrect';
        }
    } catch (error) {
        signin_status.innerText = "Service in Maintenance,try again later";
    }
}
async function signup(username, email, pwd) {
    const url = `${API_BASE_URL}/auth/signup`;
    const data = { username: username, email: email, pwd: pwd };
    try {
        const resp = await fetch(url, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const result = await resp.json();
        signup_status.innerText = result.msg;
    } catch (error) {
        console.error("Signup error:", error);
        signup_status.innerText = "Service in Maintenance, try again later";
    }
}

function valid_check(pwd) {
    if (!pwd) return {
        Valid: false,
        msg: ["Pwd Cannot be empty"]
    }
    const cases = [
        { case: /[A-Z]/.test(pwd), msg: "At least one uppercase character is required", },
        { case: /[a-z]/.test(pwd), msg: "At least one lowercase character is required", },
        { case: /[^\w\u4e00-\u9fa5\s]/.test(pwd), msg: "At least one special character is required" },
        { case: /\d/.test(pwd), msg: "At least one number is required" },
        { case: pwd.length >= 8, msg: "minimum pwd length is 8" },
    ]
    const missing = cases.filter(item => !item.case).map(item => item.msg)
    return {
        isValid: missing.length === 0,
        errors: missing
    };
}

//main

to_reset_btn.onclick = function () {
    window.location.href = '../reset/reset.html'
}
singin_btn.onclick = function (event) {
    event.preventDefault();
    username = signin_name.value.trim();
    pwd = signin_pwd.value.trim();
    if (!username || !pwd) {
        signin_status.innerText = "Fill in both Name and Password to Continue";
        return;
    } else {
        signin(username, pwd);
    }
}
signupSubmit.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = signup_id.value.trim();
    const email = signup_email.value.trim();
    const pwd = signup_pwd.value.trim();
    const pwd_confirm = signup_pwd_confirm.value.trim();
    const valid_condition = valid_check(pwd);

    if (!username || !email || !pwd) {
        signup_status.innerText = "Please fill all missing blanks";
        return;
    } else if (pwd != pwd_confirm) {
        signup_status.innerText = 'please confirm your password.'
    } else if (!valid_condition.isValid) {
        signup_status.innerText = valid_condition.errors.join("\n")
    }
    else {
        signup(username, email, pwd);
    }
})






