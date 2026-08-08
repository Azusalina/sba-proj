const isLocal = window.location.hostname === '127.0.0.1'
const API_BASE_URL = isLocal ? 'http://127.0.0.1:3000' : 'https://backend-sba.vercel.app';

const operaTitle = document.getElementById('operaTitle')
const showtimeTitle = document.getElementById('showtimeTitle');
const selectedTime = localStorage.getItem('selected_time');
const operaName = localStorage.getItem('selected');
const budget = document.getElementById("budget")
const std_low = document.getElementById("std_low")
const std_high = document.getElementById("std_high")
const premium = document.getElementById("premium")

const lv = [budget, std_low, std_high, premium];


//abbr notes:a=adult,s=student,w=wheelchair
//p=price

const change = document.querySelectorAll('#a-minus, #a-plus, #s-minus, #s-plus, #w-minus, #w-plus');
const pA = document.getElementById("pA")
const pS = document.getElementById("pS")
const pW = document.getElementById("pW")
const sum_price = document.getElementById("sum-price")
const sub_form = document.getElementById("sub-form")
const a = document.getElementById("a-status")
const s = document.getElementById("s-status")
const w = document.getElementById("w-status")
const ticket = {
    level: "",
    adult: 0,
    student: 0,
    wheelchair: 0,
};
let btn_current = null;
const sub_btn = document.getElementById('sub-btn');
//
const username = localStorage.getItem('user');
let authStatus = false;
let authName = null;

try {
    authStatus = localStorage.getItem('isLoggedIn') === 'true';
    authName = localStorage.getItem('user');
} catch (error) {
    console.error("LocalStorage is disabled or inaccessible:", error);
    authStatus = false;
    authName = null;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//subfunctions
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
async function getPrices(name, time) {
    const url = `${API_BASE_URL}/operaName`;
    const data = { name: name, time: time };
    try {
        const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        return await resp.json();
    } catch (error) {
        console.log(error);
    }
}

function updateSumPrices() {
    const getPriceNum = (element) => {
        const match = element.innerText.match(/\d+(\.\d+)?/);
        return match ? Number(match[0]) : 0;
    };

    const total =
        ticket.adult * getPriceNum(pA) +
        ticket.student * getPriceNum(pS) +
        ticket.wheelchair * getPriceNum(pW);

    sum_price.textContent = `Total Price: HK$${total.toFixed(2)}`;
}



function StoreData() {
    const opera = operaTitle.innerText.split(':')[1];
    const level = btn_current.id;
    //abbr: A=amount,a=adult,s=student,w=wheelchair
    const adult = Number(a.innerText)
    const student = Number(s.innerText)
    const wheelchair = Number(w.innerText)
    const details = {
        opera: opera,
        level: level,
        user: username,
        price_adult: Number(pA.innerText.match(/\d+/)),
        adult: adult,
        price_student: Number(pS.innerText.match(/\d+/)),
        student: student,
        price_wheelchair: Number(pW.innerText.match(/\d+/)),
        wheelchair: wheelchair,
        sum_price: Number(sum_price.innerText.match(/\d+/))
    }
    localStorage.setItem('details', JSON.stringify(details))
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//initialize
window.addEventListener('DOMContentLoaded', async () => {
    if (operaName) operaTitle.innerText = `Opera selected: ${operaName}`;
    if (showtimeTitle) showtimeTitle.innerText = `Showtime: ${formatShowtime(selectedTime)}`;
});
let data = await getPrices(operaName, selectedTime);
if (operaName) {
    operaTitle.innerText = `Opera selected:${operaName}`
}
//make lv btns mut.exlc
lv.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        ticket.adult = 0;
        ticket.student = 0;
        ticket.wheelchair = 0;
        a.innerText = 0;
        s.innerText = 0;
        w.innerText = 0;

        if (btn_current != null) {
            btn_current.classList.remove('active');
        }
        btn.classList.add('active')
        btn_current = btn;
        btn.blur();
        ticket.level = btn.id;
        updateSumPrices();
    })
});
//ticketamount+- initialize
change.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const [a, b] = btn.id.split("-");
        const statusElem = document.getElementById(`${a}-status`);
        let currentVal = Number(statusElem.innerText);
        if (b === "plus") {
            currentVal++;
        }
        if (b === "minus" && currentVal > 0) {
            currentVal--;
        }
        statusElem.innerText = currentVal;
        if (a === "a") {
            ticket.adult = currentVal;
        } else if (a === "s") {
            ticket.student = currentVal;
        } else if (a === "w") {
            ticket.wheelchair = currentVal;
        }
        btn.blur();
        updateSumPrices();
    });
});
//redir


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
`       `
//prices work zone
lv.forEach(async (btn) => {
    btn.addEventListener('click', async (event) => {
        event.preventDefault();
        const level = btn.id;
        const std_price = data.prices[level];
        //abbr:m=multiplier,A=adult,S=student,W=wheelchair
        const AdultObj = data.multipliers.find(m => m.name === 'adult')
        const mA = AdultObj ? AdultObj.multiplier : 1
        const StudentObj = data.multipliers.find(m => m.name === 'student')
        const mS = StudentObj ? StudentObj.multiplier : 1
        const WheelObj = data.multipliers.find(m => m.name === 'wheelchair')
        const mW = WheelObj ? WheelObj.multiplier : 1
        //for debug only:
        console.log(mA)
        console.log(mS)
        console.log(mW)
        const Aprice = std_price * mA;
        const Sprice = std_price * mS;
        const Wprice = std_price * mW;
        pA.innerText = `per ticket:${Aprice}`;
        pS.innerText = `per ticket:${Sprice}`;
        pW.innerText = `per ticket:${Wprice}`;
        updateSumPrices();
    })
})

sub_form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!ticket.level) {
        alert("Please select a seat class.");
        return;
    }
    if (!authStatus) {
        alert('You haven\'t signed in yet, redirecting to auth page...');
        window.location.href = '../auth/auth.html';
        return;
    }
    const totalMatch = sum_price.innerText.match(/\d+(\.\d+)?/);
    const total = totalMatch ? Number(totalMatch[0]) : 0;

    const getMultiplier = (type) => {
        const obj = data.multipliers.find(m => m.name === type);
        return obj ? obj.multiplier : 1;
    };
    const details = {
        user: username,
        opera: operaName,
        showtime: selectedTime,
        level: ticket.level,
        adult: ticket.adult,
        student: ticket.student,
        wheelchair: ticket.wheelchair,
        price_adult: data.prices[ticket.level] * getMultiplier('adult'),
        price_student: data.prices[ticket.level] * getMultiplier('student'),
        price_wheelchair: data.prices[ticket.level] * getMultiplier('wheelchair'),
        sum_price: total
    };
    localStorage.setItem('details', JSON.stringify(details));
    window.location.href = '../pay/pay.html';
});