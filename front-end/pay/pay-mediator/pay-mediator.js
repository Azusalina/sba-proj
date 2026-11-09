const isLocal = window.location.hostname === '127.0.0.1'
const API_BASE_URL = isLocal ? 'http://127.0.0.1:3000' : 'https://backend-sba.vercel.app';

const note = document.getElementById('note')
const texts = ['we are handling with your order, please wait for a few seconds.',
    'we are handling with your order, please wait for a few seconds..',
    'we are handling with your order, please wait for a few seconds...']

let index = 0;

//sub func 
function updateNote() {
    note.innerText = texts[index];
    index = (index + 1) % texts.length;
}
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const noteInterval = setInterval(updateNote, 500);


async function handlingOrder() {
    const url = `${API_BASE_URL}/PaymentOrder`
    const details = JSON.parse(localStorage.getItem('details'))
    const data = {
        user: details.user,
        opera: details.opera,
        priceId: details.priceId,
        seats: details.seats.map(seat => ({
            seat_id: seat.seat_id, audience: seat.audience
        }))
    }
    try {
        const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await resp.json().catch(() => ({}));
        clearInterval(noteInterval);
        if (resp.status === 409) {
            note.innerText = 'note that one of your selected seats was just taken, you were not charged for this'
            await sleep(3000);
            window.location.href = '../../book/book.html'
        } else if (!resp.ok) {
            note.innerText = 'server error,try again later';
            await sleep(3000);
            window.location.href = '../../index.html'
        } else if (result.msg === 'success') {
            note.innerText = 'everything are prepared, redirecting...'
            localStorage.setItem('orderId', result.orderId);
            localStorage.setItem('orderTotal', result.total);
            localStorage.setItem('tickets', JSON.stringify(result.tickets));
            await sleep(2000);
            window.location.href = '../../OrderConfirm/OrderConfirm.html'
        } else if (result.msg === 'insufficientBalance') {
            note.innerText = ('order was canceled, cuz insufficient amount left in your wallet');
            await sleep(2000);
            window.location.href = '../../index.html'
        } else {
            note.innerText='sth is wrong but we dunno.'
            await sleep(2000);
            window.location.href = '../../index.html'

        }

    } catch (error) {
        console.log(error)
        clearInterval(noteInterval);
        note.innerText = 'service in maintainance'
    }
}
//init
handlingOrder();
