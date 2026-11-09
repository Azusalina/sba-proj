//this serves as a util file actually
export const ZONES = ['premium', 'std_high', 'std_low', 'budget'];

export function seatLabel(seat) {
    return `${seat.row}${seat.col}`;
}

export function groupByRow(seats) {
    const rows = new Map();
    //this should be the first i use for in this syntax , anyways
    for (const seat of seats) {
        if (!rows.has(seat.row)) rows.set(seat.row, []);
        rows.get(seat.row).push(seat);
    }
    for (const list of rows.values()) list.sort((a, b) => a.col - b.col);
    return rows;
}

export function seatUnitPrice(zonePrice, multipliers, audience) {
    const found = multipliers.find(m => m.name === audience);
    const multiplier = found ? Number(found.multiplier) : 1;
    return Math.round(Number(zonePrice) * multiplier * 100) / 100;
}


export function renderSeatGrid(container, seats, options = {}) {
    const { selected = new Set(),
        clickable = (seat) => seat.state === 'idle',
        dim = () => false,
        onSeatClick = () => { }
    } = options;


    container.innerHTML = '';
    for (const [row, list] of groupByRow(seats)) {
        const line = document.createElement('div');
        line.className = 'seat-row';

        const name = document.createElement('span');
        name.className = 'seat-row-name';
        name.textContent = row;
        line.appendChild(name);

        for (const seat of list) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `seat zone-${seat.zone} state-${seat.state}`;
            if (seat.accessible) btn.classList.add('accessible');
            if (selected.has(seat.seat_id)) btn.classList.add('selected');
            if (dim(seat)) btn.classList.add('dim');
            btn.textContent = seat.col;
            btn.disabled = !clickable(seat);
            btn.dataset.seatId = seat.seat_id;
            btn.title = `${seatLabel(seat)}-${seat.zone} -${seat.state}`;
            //i dunno why im adding aria label here but as long as the tutorial said so, and not adding it makes my function=>insufficient params,well, thats it
            btn.setAttribute(`aria-label`, `Row ${row} seat ${seat.col}, ${seat.zone} ,${seat.state}${seat.accessible ? ',wheelchair space' : ''}`)
            btn.setAttribute('aria-pressed', selected.has(seat.seat_id) ? 'true' : 'false');
            btn.addEventListener('click', () => onSeatClick(seat));
            line.appendChild(btn);
        }
        container.appendChild(line);
    }
}