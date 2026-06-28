const sel_op = document.getElementById('select_options')
const ops = document.querySelectorAll('#select_options .options')

let opera = null;
ops.forEach(op => {
    op.addEventListener('click', function (e) {
        e.stopPropagation();
        const parent = this.parentNode;
        if (parent) {
            parent.insertBefore(this, parent.firstElementChild);
            parent.classList.add('clicked');
        }
        opera = this.innerText.trim();
        console.log(opera);
        send();
    });
});

sel_op.addEventListener('mouseleave', function () {
    this.classList.remove('clicked');
});


function updateTotal() {
    const p1 = Number(a1p1.innerText) || 0;
    const p2 = Number(a1p2.innerText) || 0;
    const p3 = Number(a1p3.innerText) || 0;
    const p4 = Number(a1p4.innerText) || 0;

    const countA = Number(a3a.innerText) || 0;
    const countB = Number(a3b.innerText) || 0;
    const countC = Number(a3c.innerText) || 0;
    const countD = Number(a3d.innerText) || 0;

    let sum = (p1 * countA) + (p2 * countB) + (p3 * countC) + (p4 * countD);

    sum_p.innerText = `Total: ${sum}`;
}


// divide line 
function add(a) {
    let current = Number(a.innerText);
    a.innerText = current + 1;
    updateTotal();
}
function minus(a) {
    let current = Number(a.innerText);
    if (current == 0) {
        return
    }
    a.innerText = current - 1;
    updateTotal();
}

const a2a = document.getElementById("a2a")
const a3a = document.getElementById("a3a")
const a4a = document.getElementById("a4a")

a2a.onclick = function () {
    minus(a3a);
}
a4a.onclick = function () {
    add(a3a);
}

const a2b = document.getElementById("a2b")
const a3b = document.getElementById("a3b")
const a4b = document.getElementById("a4b")

a2b.onclick = function () {
    minus(a3b);
}
a4b.onclick = function () {
    add(a3b);
}

const a2c = document.getElementById("a2c")
const a3c = document.getElementById("a3c")
const a4c = document.getElementById("a4c")

a2c.onclick = function () {
    minus(a3c);
}
a4c.onclick = function () {
    add(a3c);
}

const a2d = document.getElementById("a2d")
const a3d = document.getElementById("a3d")
const a4d = document.getElementById("a4d")

a2d.onclick = function () {
    minus(a3d);
}
a4d.onclick = function () {
    add(a3d);
}


//divide line
const a1p1 = document.getElementById("a1p1");
const a1p2 = document.getElementById("a1p2");
const a1p3 = document.getElementById("a1p3");
const a1p4 = document.getElementById("a1p4");
const sum_p = document.getElementById("sum_p");


async function send() {
    url = "http://127.0.0.1:3000/opera_name"
    const data = { a: opera }
    try {
        const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (resp.ok) {
            const result = await resp.json();
            console.log(result);
            a1p1.innerText = result.budget;
            a1p2.innerText = result.std_low;
            a1p3.innerText = result.std_high;
            a1p4.innerText = result.premium;
            updateTotal();
        }
    } catch (error) {
        console.log("err");
    }
}
