import * as sort from './sort.js'

const search = document.getElementById("main");
const bar = document.getElementById("bar");


search.addEventListener("submit", (event) => {
    event.preventDefault();
    bar.focus();
})

const price_indicator = document.getElementById("p_indicator");
const s_bar = document.getElementById("s_bar");

s_bar.addEventListener("input", () => {
    price_indicator.innerText = `price:${s_bar.value}`;
});
//////////////////////////////////////////////////////////////////


const content_container = document.querySelector('.content-display')
const aida = document.getElementById('aida')
const carmen = document.getElementById('carmen')
const rigoletto = document.getElementById('rigoletto')
const la_traviata = document.getElementById('la-traviata')
const zauberflote = document.getElementById('zauberflote')


const DOMoperaList = [aida, carmen, rigoletto, la_traviata, zauberflote];

window.onload = function () {
    const hist = localStorage.getItem("search_content");
    if (hist) {
        const a = JSON.parse(hist);
        bar.value = a;
    }
    const filterlist = document.querySelectorAll('input[name="sort"]');
    filterlist.forEach((status) => {
        if (status) status.checked = false;
    });

};

async function updateOperaData(name) {
    const url = 'http://127.0.0.1:3000/updateOperaData';
    const data = { name: name };
    try {
        const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (!resp.ok) {
            throw new Error(`HTTP error! status: ${resp.status}`);
        }
        const result = await resp.json();
        return result;
    } catch (error) {
        console.log(error);
    }
}
async function ReqOperaData() {
    const promises = DOMoperaList.map(async (per) => {
        const operaResult = await updateOperaData(per.id);
        if (operaResult?.status) {
            return {
                id: per.id,
                duration: operaResult.data.duration,
                time: operaResult.data.show_time,
                rate: Number(operaResult.data.rate),
                price: Number(operaResult.data.price),
            };
        }
        return null;
    });
    const result = await Promise.all(promises);
    return result.filter(item => item !== null);
}

function renderOperaData(Final) {
    Final.forEach(opera => {
        const article = document.getElementById(opera.id);
        article.querySelector(".price").textContent = `Price: $${opera.price}`;
        article.querySelector(".rate").textContent = `Rate: ${opera.rate}/10`;
        const date = new Date(opera.time);
        article.querySelector(".time").textContent = `Show Time: ${date.toLocaleString()}`;
        article.querySelector(".duration").textContent = `Duration: ${opera.duration} min`;
    });
}


const Final = await ReqOperaData();
renderOperaData(Final);
///////////////////////


const FilterStatus_name = document.getElementById('FilterStatus_name')
const FilterStatus_price = document.getElementById('FilterStatus_price')
const FilterStatus_time = document.getElementById('FilterStatus_time')
const FilterStatus_rate = document.getElementById('FilterStatus_rate')
const FilterStatus_avail = document.getElementById('FilterStatus_avail')
const FilterStatusList = [FilterStatus_name, FilterStatus_price, FilterStatus_time, FilterStatus_rate, FilterStatus_avail]
const algo_display = document.getElementById("algo-display");

FilterStatusList.forEach((status) => {
    status.addEventListener('change', async () => {
        if (status.checked) {
            const [prefix, section] = status.id.split('_');
            if (section === 'name') {
                sort.merge_name(Final);
                algo_display.innerText = 'Current Algorithm implemented:merge sort'
            }
            if (section === 'time') {
                sort.insertion_time(Final);
                algo_display.innerText = 'Current Algorithm implemented:insertion sort'
            }
            if (section === 'price') {
                sort.bubble_ascending_price(Final);
                algo_display.innerText = 'Current Algorithm implemented:bubble sort'
            }
            if (section === 'rate') {
                sort.bubble_ascending_rate(Final);
                algo_display.innerText = 'Current Algorithm implemented:bubble sort'
            }
            Final.forEach((item) => {
                const domElement = document.getElementById(item.id);
                if (domElement) {
                    content_container.appendChild(domElement);
                }
            });
            renderOperaData(Final);
        }
    })
})
//////////////////////////////////////////////////////////////////
