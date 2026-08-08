const isLocal = window.location.hostname === '127.0.0.1'
const API_BASE_URL = isLocal ? 'http://127.0.0.1:3000' : 'https://backend-sba.vercel.app';


const uid = document.getElementById('uid')
const id = document.getElementById('id')
const create_at = document.getElementById('create_at')
const email = document.getElementById('email')
const birth = document.getElementById('birth')

const updatePwd_btn = document.getElementById('updatePwd-btn')
const updateEmail_btn = document.getElementById('updateEmail-btn')
const updateBirth_btn = document.getElementById('updateBirth-btn')

const wallet = document.getElementById('wallet')
const order_list = document.getElementById('order-list')
const redemption = document.getElementById('redemption')
const gift_code = document.getElementById('gift-code')


const redeem_status = document.getElementById('redeem-status')





//subfunc
function formatShowtime(time) {
    if (!time) return 'N/A';
    const d = new Date(time);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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
async function GetOrders(user) {
    const url = `${API_BASE_URL}/settingsGetOrders`;
    try {
        const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: user })
        });
        if (resp.ok) {
            const result = await resp.json();
            order_list.innerHTML = '';
            if (result.status && Array.isArray(result.orders)) {
                const activeOrders = result.orders.filter(o => o.transac_status !== 'REFUNDED');
                if (activeOrders.length === 0) {
                    order_list.innerText = 'No orders yet.';
                } else {
                    activeOrders.forEach(o => order_list.appendChild(createOrderRow(o)));
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}
function createOrderRow(order) {
    const container = document.createElement('div');
    container.className = 'container';

    const breakdownHtml = (order.ticket_breakdown || [])
        .map(t => `<span class="ticket-line">${t.count} × ${t.seat_class} (${t.seat_class2})</span>`)
        .join('');

    const info = document.createElement('div');
    info.className = 'order-info';
    info.innerHTML = `
        <span class="order-opera">${order.opera_name || 'N/A'}</span>
        <span class="order-date">${formatShowtime(order.book_time)}</span>
        <div class="ticket-breakdown">${breakdownHtml}</div>
        <span class="order-amount">HK$${Number(order.sum_fee).toFixed(2)}</span>
        <span class="order-status">${order.transac_status}</span>
    `;
    container.appendChild(info);

    const refundBtn = document.createElement('button');
    refundBtn.className = 'refund-btn';

    if (order.transac_status !== 'COMPLETED') {
        refundBtn.innerText = order.transac_status;
        refundBtn.disabled = true;
    } else {
        refundBtn.innerText = 'Refund';
        refundBtn.addEventListener('click', () => handleRefund(order.order_id, container, refundBtn));
    }

    container.appendChild(refundBtn);
    return container;
}  
//
let isRefunding = false;
async function handleRefund(orderId, container, btn) {
    if (isRefunding) return;
    if (!confirm('Are you sure you want to refund this order? This cannot be undone.')) return;

    isRefunding = true;
    btn.disabled = true;
    btn.innerText = 'Processing...';

    try {
        const resp = await fetch(`${API_BASE_URL}/refundOrder`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: user, order_id: orderId })
        });
        const result = await resp.json();

        if (result.msg === 'success') {
            wallet.innerText = result.balance;
            container.remove();
            if (order_list.children.length === 0) {
                order_list.innerText = 'No orders yet.';
            }
        } else if (result.msg === 'not_refundable') {
            alert('This order has already been refunded or cannot be refunded.');
            container.remove();
        } else {
            alert('Refund failed. Please try again.');
            btn.disabled = false;
            btn.innerText = 'Refund';
        }
    } catch (error) {
        console.log(error);
        alert('Network error. Please try again.');
        btn.disabled = false;
        btn.innerText = 'Refund';
    } finally {
        isRefunding = false;
    }
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
    GetData(user);
    GetOrders(user);
})

redemption.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = gift_code.value
    redeem(user, code);
})

updatePwd_btn.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.href = '../reset/reset.html'
})
//main