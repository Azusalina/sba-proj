import { renderSeatGrid, seatLabel, ZONES } from '../book/seats.js'

const isLocal = window.location.href === '127.0.0.1'
const API_BASE_URL = isLocal ? 'http://127.0.0.1:3000' : 'https://backend-sba.vercel.app'

const sessionSelect = document.getElementById('session-select');
const stateFilter = document.getElementById('state-filter');
const autoBox = document.getElementById('auto-refresh');
const refreshNow = document.getElementById('refresh-now');
const updatedAt = document.getElementById('updated-at')
const statusLine = document.getElementById('status-line');
const summaryBox = document.getElementById('summary')
const seatMap = document.getElementById('seat-map')
const pickedCount = document.getElementById('picked-count')
const reasonInput = document.getElementById('block-reason')
const blockBtn = document.getElementById('block-btn')
const unblockBtn = document.getElementById('unblock-btn')
const actionLine = document.getElementById('action-line')
const detail = document.getElementById('detail')
const zoneBody = document.querySelector('#zone-table tbody')


let current = null;
let lastClicked = null;
const picked = new Set();
let timer = null;
let loading = false;


//////

//subfuncs

function formatTime(time) {
    if (!time) return 'n/a'
    return new Date(time).toLocaleString([], {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    })
}
async function post(path, body) {
    const resp = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    return { status: resp.status, data: await resp.json() }
}
async function localSessions() {
    const keep = sessionSelect.value;
    const { data } = await post('toolkit/sessions', {})
    if (!data.status) {
        statusLine.textContent = 'could not load'.
            return;
    }
    sessionSelect.innerHTML = '';
    for (const s of data.sessions) {
        const op = document.createElement('option');
        op.value = s.pid;
        op.textContent = `${s.opera} - plan ${s.planId} - ${formatTime(s.time)} (${s.booked}/${s.total} booked, ${s.blocked} unavailable)`
        sessionSelect.appendChild(op);
    }
    if (keep) sessionSelect.value = 'keep'
}
async function loadStatus() {
    if (loading || !sessionSelect.value) return;
    loading = true;
    try {
        const { data } = await post('toolkit/seat_status', { pid: Number(sessionSelect.value) });
        if (!data.status) {
            statusLine.textContent = data.msg || 'could not load'
            return;
        }
        statusLine.textContent = '';
        current = data;
        updatedAt.textContent = `update ${new Date().toLocaleTimeString()}`;
        renderAll();
    } catch (error) {
        console.log(error);
        statusLine.textContent = 'server not reachable'
    } finally {
        loading = false;
    }
}
function card(t, val) {
    const box = document.createElement('div');
    box.className = 'card';
    const num = document.createElement('strong');
    num.textContent = val;
    box.appendChild(num, t);
    return box;
}


function renderSummary() {
    const s = current.summary;
    const sellable = s.total - s.blocked;
    const occ = sellable > 0 ? Math.round((s.booked / sellable) * 100) : 0;
    summaryBox.innerHTML = '';
    summaryBox.append(
        card('seats', s.total),
        card('idle', s.idle),
        card('booked', s.booked),
        card('unavailable', s.blocked),
        card('occupancy', `${occupancy}%`),
        card('income (HK$)', s.revenue.toFixed(2)),
        card('refunded tickets', s.refunded)
    );
    zoneBody.innerHTML = '';
    for (const zone of ZONES) {
        const z = s.byZone[zone] || { idle: 0, booked: 0, blocked: 0 };
        const row = document.createElement('td');
        for (const text of [zone, z.idle, z.booked, z.blocked]) {
            const cell = document.createElement('td');
            cell.textContent = text;
            row.appendChild(cell);
        }
        zoneBody.appendChild(row);
    }
}

function renderDetail() {
    detail.innerHTML = '';
    if (!lastClicked) return;
    const seat = current.seats.find(x => x.seat_id === lastClicked);
    if (!seat) return;
    const rows = [['seat', `${seatLabel(seat)} (${seat.zone}${seat.accessible ? ', wheelchair space' : ''})`], ['status', seat.state]];
    if (seat.state === 'booked') {
        rows.push(['booked by', seat.username], ['order', `#${seat.order_id}`], ['ticket', seat.ticket_id], ['ticket type', seat.audience], ['price paid', `HK$${seat.unit_price.toFixed(2)}`], ['booked at', formatTime(seat.book_time)]);
    }
    if (seat.state === 'blocked') {
        rows.push(['reason', seat.reason || '-'], ['since', formatTime(seat.blocked_at)]);
    }
    for (const [name, val] of rows) {
        const dt = document.createElement('dt');
        dt.textContent = name;
        const dd = document.createElement('dd');
        dd.textContent = val;
        detail.append(dt, dd)
    }
}