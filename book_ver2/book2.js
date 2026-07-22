const budget = document.getElementById("budget")
const std_low = document.getElementById("std_low")
const std_high = document.getElementById("std_high")
const premium = document.getElementById("premium")

const lv = [budget, std_low, std_high, premium];
const ticket = {
    level: "",
    adult: 0,
    student: 0,
    wheelchair: 0,
};
let btn_current = null;
lv.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (btn_current != null) {
            btn_current.classList.remove('active');
        }
        btn.classList.add('active')
        btn_current = btn;
        btn.blur();
        ticket.level = btn.id;
        update();
    })
});


const change = document.querySelectorAll('#a-minus, #a-plus, #s-minus, #s-plus, #w-minus, #w-plus');
const pA = document.getElementById("pA")
const pS = document.getElementById("pS")
const pW = document.getElementById("pW")
const sum_price = document.getElementById("sum-price")
function update() {
    const total =
        ticket.adult * Number(pA.innerText.match(/\d+/)[0]) +
        ticket.student * Number(pS.innerText.match(/\d+/)[0]) +
        ticket.wheelchair * Number(pW.innerText.match(/\d+/)[0]);
    sum_price.textContent = `Total Price: HK$${total}`;
}
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
        update();
    });
});
const sub_form = document.getElementById("sub-form")
const a = document.getElementById("a-status")
const s = document.getElementById("s-status")
const w = document.getElementById("w-status")
sub_form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!ticket.level) {
        alert("Please select a seat class.");
        return;
    }
    localStorage.setItem("ticket", JSON.stringify(ticket));
    window.location.href = "../pay.html"
})

url = "http://127.0.0.1:3000/opera_name"
