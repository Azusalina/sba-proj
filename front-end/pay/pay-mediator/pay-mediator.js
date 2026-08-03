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
    url = 'http://127.0.0.1:3000/PaymentOrder'
    data = JSON.parse(localStorage.getItem('details'))
    try {
        const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (resp.ok) {
            const result = await resp.json();
            clearInterval(noteInterval);
            if (result.msg == 'success') {
                note.innerText = 'everything are prepared. Redirecting...';
                localStorage.setItem('orderId', result.orderId);
                localStorage.setItem('tickets', JSON.stringify(result.tickets));
                await sleep(2000);
                window.location.href='../../OrderConfirm/OrderConfirm.html'
            } else if (result.msg === 'insufficientBalance') {
                note.innerText = 'Order was canceled due to insufficient amount left in your wallet.';
                await sleep(2000);
                window.location.href = '../../main/main.html'
            } else {
                note.innerText = 'An unexpected error occurred.';
                await sleep(2000);
                window.location.href = '../../main/main.html'
            }
        } else {
            note.innerText = 'Server error. Please try again.';
            await sleep(3000);
            window.location.href = '../../main/main.html'
        }
    } catch (error) {
        console.log(error)
        clearInterval(noteInterval);
        note.innerText = 'service in maintainance'
    }
}
//init
handlingOrder();