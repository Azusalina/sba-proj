import { renderSeatGrid, seatLabel, seatUnitPrice, ZONES } from './seats.js'

const isLocal = window.location.hostname === '127.0.0.1'
const API_BASE_URL = isLocal ? 'http://127.0.0.1:3000' : 'https://backend-sba.vercel.app';

const MAX_SEATS = 8;
const AUDIENCES = ['adult', 'student', 'wheelchair'];

const operaTitle = document.getElementById('operaTitle');
const showtimeTitle = document.getElementById('showtimeTitle');
const priceStatus = document.getElementById('price-status');
const seatMap = document.getElementById('seat-map');
const zonePrices = document.getElementById('zone-prices');
const selectedList = document.getElementById('selected-list');
const sumPrice = document.getElementById('sum-price');
const subForm = document.getElementById('sub-form');
const refreshBtn = document.getElementById('refresh-seats')

const operaName = localStorage.getItem('selected');
const selectedTime = localStorage.getItem('selected_time');
const priceId = Number(localStorage.getItem('selected_price_id'));
const username = localStorage.getItem('user');
let authStatus = false;
try {
    authStatus = localStorage.getItem('isLoggedIn') === 'true;'
} catch (error) {
    console.error('localstorage 404', error)
}

let hall = null;
const chosen = new Map();


//sub-funcs
function formatShowtime(time) {
    if (!time) return 'N/A';
    return new Date(time).toLocaleString([], {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}
async function loadHall() {
    try {
        const resp = await fetch(`${API_BASE_URL}/seatMap`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ name: operaName, priceId })
        });
        if (!resp.ok) throw new Error(`http error ${resp.status}`);
        const data = await resp.json();
        if (!data.status) {
            priceStatus.textContent = data.msg || `Seat map could not be loaded`;
            return null;
        }
        priceStatus.textContent = '';
        return data
    } catch (error) {
        console.log(error);
        priceStatus.textContent = `Seat map could not be loaded`;
        return null;
    }
}
function seatById(id) {
    return hall.seats.find(seat => seat.seat_id === id);
}
function priceOf(seat, audience) {
    return seatUnitPrice(hall.prices[seat.zone], hall.multipliers, audience);
}
function totalPrice() {
    let sum = 0;
    for (const [id, audience] of chosen) sum += priceOf(seatById(id), audience);
    return Math.round(sum * 100) / 100;
}
function toggleSeat(seat) {
    if (chosen.has(seat.seat_id)) {
        chosen.delete(seat.seat_id);
    } else if (chosen.size >= MAX_SEATS) {
        alert(`you can choose at most ${MAX_SEATS} seats at once`);
        return;
    } else {
        chosen.set(seat.seat_id, 'adult');
    }
    render();
}
function renderSelectedList() {
    selectedList.innerHTML = '';
    for (const [id, audience] of chosen) {
        const seat = seatById(id);
        const item = document.createElement('li');
        const label = document.createElement('strong');
        label.textContent = `${seatLabel(seat)}(${seat.zone})`;

        const select = document.createElement('select');
        for (const type of AUDIENCES) {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            option.disabled = (type === 'wheelchair' && seat.accessible);
            select.appendChild(option);
        }
        select.value = audience;
        select.addEventListener('change', () => {
            chosen.set(id, select.value);
            render();
        });

        const price = document.createElement('span');
        price.textContent = `HK$${priceOf(seat, audience).toFixed(2)}`;

        const rm = document.createElement('button');
        rm.type = 'button';
        rm.textContent = 'remove';
        rm.addEventListener('click', () => {
            chosen.delete(id);
            render();
        });
        item.append(label, select, price, rm);
        selectedList.appendChild(item);
    }
}
function render() {
    renderSeatGrid(seatMap, hall.seats, {
        selected: new Set(chosen.keys()),
        onSeatClick: toggleSeat
    });
    renderSelectedList();
    sumPrice.textContent = `Total price: HK$${totalPrice().toFixed(2)}`;
}
async function reload() {
    const data = await loadHall();
    if (!data) return;
    hall = data;

    for (const id of [...chosen.keys()]) {
        const seat = seatById(id);
        if (!seat || seat.state !== 'idle') chosen.delete(id);
    }
    zonePrices.innerHTML = '';
    for (const zone of ZONES) {
        const item = document.createElement('li');
        item.textContent = `${zone}:HK$${hall.prices[zone]}`;
        zonePrices.appendChild(item);
    }
    render();
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//init


if (operaName) operaTitle.innerText = `Opera selected:${operaName}`;
showtimeTitle.innerText = `Showtime:${formatShowtime(selectedTime)}`;
await reload();

refreshBtn.addEventListener('click', reload);

subForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!hall || chosen.size === 0) {
        alert('maybe you should select at least one seat.');
        return;
    }
    if (!authStatus) {
        alert('you haven\'t signed in yet, redirecting to the auth page...');
        window.location.href = '../auth/auth.html';
        return;
    }

    const seats = [...chosen].map((id, audience) => {
        const seat = seatById(id);
        return {
            seat_id: id,
            label: seatLabel(seat),
            zone: seat.zone,
            audience: audience,
            price: priceOf(seat, audience)
        };
    });
    const details = {
        user: username,
        opera: operaName,
        priceId: priceId,
        showtime: selectedTime,
        seats: seats,
        sum_price: totalPrice()
    };
    localStorage.setItem('details', JSON.stringify(details));
    window.location.href = '../pay/pay.html'
})