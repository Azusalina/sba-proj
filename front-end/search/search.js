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
        const result = await updateOperaData(per.id);
        if (result && result.status) {
            const data = result.data;
            return {
                id: per.id,
                duration: data.duration,
                time: data.show_time,
                rate: data.rate
            };
        }
        return null;
    })
    const result = await Promise.all(promises);
    const Final = result.filter(result => result !== null);
    return Final;
}


const content_container = document.querySelector('.content-display')
const aida = document.getElementById('aida')
const carmen = document.getElementById('carmen')
const rigoletto = document.getElementById('rigoletto')
const la_traviata = document.getElementById('la-traviata')
const zauberflote = document.getElementById('zauberflote')


const DOMoperaList = [aida, carmen, rigoletto, la_traviata, zauberflote];

///////////////////////



const FilterStatus_name = document.getElementById('FilterStatus_name')
const FilterStatus_price = document.getElementById('FilterStatus_price')
const FilterStatus_time = document.getElementById('FilterStatus_time')
const FilterStatus_rate = document.getElementById('FilterStatus_rate')
const FilterStatus_avail = document.getElementById('FilterStatus_avail')

const FilterStatusList = [FilterStatus_name, FilterStatus_time, FilterStatus_rate, FilterStatus_avail]

FilterStatusList.forEach((status) => {
    status.addEventListener('change', async () => {
        if (status.checked) {
            const Final = await ReqOperaData();
            const [prefix, section] = status.id.split('_');
            if (section === 'name') {
                sort.merge_typeB(Final);
            }
            if (section === 'time') {
                sort.insertion_timeVer(Final);
            }
            Final.forEach((item) => {
                const domElement = document.getElementById(item.id);
                if (domElement) {
                    content_container.appendChild(domElement);
                }
            });
        }
    })
}
)















window.onload = function () {
    const hist = localStorage.getItem("search_content");
    if (hist) {
        const a = JSON.parse(hist);
        bar.value = a;
    }
    FilterStatusList.forEach((status) => {
        if (status) status.checked = false;
    });
};