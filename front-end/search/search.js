import * as sort from './sort.js'

const price_indicator = document.getElementById("p_indicator");
const slide_bar = document.getElementById("s_bar");
const main = document.getElementById('main')
const search = document.getElementById("main");
const bar = document.getElementById("bar");
//operas
const content_container = document.querySelector('.content-display')
const aida = document.getElementById('aida')
const carmen = document.getElementById('carmen')
const rigoletto = document.getElementById('rigoletto')
const la_traviata = document.getElementById('la-traviata')
const zauberflote = document.getElementById('zauberflote')


//
const AlloperaID = document.querySelectorAll('article h1')
const DOMoperaList = [aida, carmen, rigoletto, la_traviata, zauberflote];
//
//filter
const FilterStatus_name = document.getElementById('FilterStatus_name')
const FilterStatus_price = document.getElementById('FilterStatus_price')
const FilterStatus_time = document.getElementById('FilterStatus_time')
const FilterStatus_rate = document.getElementById('FilterStatus_rate')
const FilterStatus_avail = document.getElementById('FilterStatus_avail')
const algo_display = document.getElementById("algo-display");
const time_display = document.getElementById('time-display')
const plan_display = document.getElementById('plan-display')
//
const FilterStatusList = [FilterStatus_name, FilterStatus_price, FilterStatus_time, FilterStatus_rate, FilterStatus_avail]
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//sub-functions
function updateTime() {
    if (!time_display) {
        time_display = document.getElementById('time-display');
    }
    if (time_display) {
        const now = new Date();
        const timestring = now.toLocaleTimeString();
        time_display.innerText = `current time: ${timestring}`;
    }
}
updateTime();
setInterval(updateTime, 1000)
function levenshtein(searchInput, data) {
    const a = searchInput.length;
    const b = data.length;
    const arr = [];
    for (let i = 0; i <= a; i++) {
        arr[i] = [];
    }
    for (let i = 0; i <= a; i++) {
        arr[i][0] = i;
    }
    for (let j = 0; j <= b; j++) {
        arr[0][j] = j;
    }
    for (let i = 1; i <= a; i++) {
        for (let j = 1; j <= b; j++) {
            if (searchInput[i - 1] === data[j - 1]) {
                arr[i][j] = arr[i - 1][j - 1];//inherite last result in previous diagonal block if no change
            } else {
                arr[i][j] = Math.min(
                    arr[i - 1][j] + 1,    // Del
                    arr[i][j - 1] + 1,    // Insert
                    arr[i - 1][j - 1] + 1 // Sub
                );
            }
        }
    }
    const result = arr[a][b];
    return result;
}
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
        if (result.status && result.plan) {
            const plan_display = document.getElementById('plan-display');
            if (plan_display) {
                plan_display.innerText = `current price plan adopted: Plan ${result.plan}`;
            }
        }
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
        article.querySelector(".price").textContent = `Budget Price: $${opera.price}`;
        article.querySelector(".rate").textContent = `Rate: ${opera.rate}/10`;
        const date = new Date(opera.time);
        article.querySelector(".time").textContent = `Show Time: ${date.toLocaleString()}`;
        article.querySelector(".duration").textContent = `Duration: ${opera.duration} min`;
    });
}

function AccordingToSearchBar() {
    const content = bar.value.trim().toLowerCase();
    DOMoperaList.forEach((element) => {
        const target = element.id.toLowerCase()
        let val;
        if (target.includes(content)) {
            val = -1;
        } else {
            val = levenshtein(content, element.id)
        }


        element.dataset.data = val;
    })
    const updatedList = sort.quick_v2(DOMoperaList);
    return updatedList;
}

function executeSearch() {
    const updatedList = AccordingToSearchBar();
    updatedList.forEach((element) => {
        if (element) {
            content_container.appendChild(element);
        }
    });
    algo_display.innerText = 'Current Algo implied: Levenshtein distance';
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////
//startup inialize
const Final = await ReqOperaData();
//inherit
const hist = localStorage.getItem("search_content");
if (hist) {
    const a = hist;
    bar.value = a;
    executeSearch();
}
//preset FilterStatus -> false
const filterlist = document.querySelectorAll('input[name="sort"]');
filterlist.forEach((status) => {
    if (status) status.checked = false;
});

slide_bar.addEventListener("input", () => {
    price_indicator.innerText = `price:${s_bar.value}`;
});
const redir_link = 'http://127.0.0.1:5500/front-end/book/book.html'
AlloperaID.forEach((tag) => {
    tag.style.cursor = 'pointer';
    tag.addEventListener('click', () => {
        const operaName = tag.dataset.id;
        console.log(operaName)
        localStorage.setItem('selected', operaName);
        window.location.href = redir_link;
    })
});

renderOperaData(Final);
//
////////////////////////////////////////////////////////////////////////////////////////////////
////search-bar related working zone:

main.addEventListener('submit', (event) => {
    event.preventDefault();
    executeSearch();
})

////////////////////////////////////////////////////////////////////////////////////////////////
//filter section working zone

//sort algo apply
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
