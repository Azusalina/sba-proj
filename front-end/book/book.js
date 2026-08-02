const operaTitle = document.getElementById('operaTitle')

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
//important items:
const operaName = localStorage.getItem('selected');
//
const sub_btn = document.getElementById('sub-btn');




//subfunctions
async function getPrices(name) {
    const url = "http://127.0.0.1:3000/operaName";
    const data = { name: operaName };
    try {
        const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (!resp.ok) {
            throw new Error(`HTTP error! status: ${resp.status}`);
        } else {
            const result = await resp.json();
            return result;
        }
    } catch (error) {
        console.log(error)
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











//initialize
const data = await getPrices();
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

sub_btn.onclick = function (e) {
    e.preventDefault();
    const sum_p=sum_price.textContent.match(/\d+/);
    localStorage.setItem('price',sum_p)
    window.location.href = "../pay/pay.html";
}

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
    localStorage.setItem("ticket", JSON.stringify(ticket));
    window.location.href = "../pay.html"
})
