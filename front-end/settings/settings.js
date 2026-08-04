const isLocal = window.location.hostname === '127.0.0.1'
const API_BASE_URL = isLocal ? 'http://127.0.0.1:3000' : 'https://backend-sba.vercel.app';


const uid = document.getElementById('uid')
const id = document.getElementById('id')
const create_at = document.getElementById('create_at')
const email = document.getElementById('email')
const birth = document.getElementById('birth')

const wallet = document.getElementById('wallet')
const redemption = document.getElementById('redemption')
const gift_code = document.getElementById('gift-code')


const redeem_status = document.getElementById('redeem-status')
//subfunc


async function GetData(user) {
    const url = `${API_BASE_URL}/settingGetData`;
    const data = { username: user };
    try {
        const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (resp.ok) {
            const result = await resp.json();
            uid.innerText = result.uid;
            id.innerText = result.id;
            create_at.innerText = result.create_at ? result.create_at.split('T')[0] : '--';
            birth.innerText = result.birth ? result.birth.split('T')[0] : '--';
            email.innerText = result.email;
            wallet.innerText = result.balance;
        }
    } catch (error) {
        console.log(error)
    }
}

async function updateData() {

}
let isRedeeming = false;
async function redeem(user, code) {
    if (isRedeeming) return;
    if (!code) return;
    const url = `${API_BASE_URL}/redeem`
    const data = { user: user, code: code }
    try {
        const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (resp.ok) {
            const result = await resp.json();
            if (result.msg === 'redeemed') {
                redeem_status.innerText = 'Successfully redeemed!';
                redeem_status.style.color = "green";
                wallet.innerText = result.balance;
                gift_code.value = "";
            } else if (result.msg === 'invalid') {
                redeem_status.innerText = 'Code is invalid.';
                redeem_status.style.color = "red";
            } else if (result.msg === 'already redeemed') {
                redeem_status.innerText = 'Code has already been redeemed.';
                redeem_status.style.color = "red";
            }
        }
    } catch (error) {
        console.log(error)
    } finally {
        isRedeeming = false;
    }

}




//init
const user = localStorage.getItem('user')
document.addEventListener('DOMContentLoaded', () => {
    gift_code.value = "";
    GetData(user)
})

redemption.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = gift_code.value
    redeem(user, code);
})
//main