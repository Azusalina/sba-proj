const isLocal = window.location.hostname === '127.0.0.1'
const API_BASE_URL = isLocal ? 'http://127.0.0.1:3000' : 'https://backend-sba.vercel.app';
const FRONTEND_URL=isLocal?'http://127.0.0.1:5500':'https://frontend-sba.vercel.app'

import * as sort from './sort.js'

const price_indicator = document.getElementById("p_indicator");
const slide_bar = document.getElementById("s_bar");
const main = document.getElementById('main')
const bar = document.getElementById("bar");
//operas
const content_container = document.querySelector('.content-display')
//
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const page_num = document.getElementById('page-num')
let currentPage = 1;
const itemsPerPage = 3;
let currentDataset = [];

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
    const url = `${API_BASE_URL}/updateOperaData`;
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
    const operaResult = await updateOperaData();
    if (operaResult?.status && Array.isArray(operaResult.data)) {
        return operaResult.data.map(opera => ({
            id: opera.opera_name.toLowerCase().replace(/\s+/g, '-'),
            name: opera.opera_name,
            duration: opera.duration,
            time: opera.show_time,
            rate: Number(opera.rate),
            price: Number(opera.price)
        }));
    }
    return [];
}
function createOperaArticle(opera) {
    const article = document.createElement('article');
    article.id = opera.id;

    const date = new Date(opera.time);
    article.innerHTML = `
        <img src="placeholder.png">
        <div class="info_container">
            <h1 data-id="${opera.id}">${opera.name}</h1>
            <label class="price">Budget Price: $${opera.price}</label>
            <label class="rate">Rate: ${opera.rate}/10</label>
            <label class="time">Show Time: ${date.toLocaleString()}</label>
            <label class="duration">Duration: ${opera.duration} min</label>
        </div>
    `;

    const titleTag = article.querySelector('h1');
    titleTag.style.cursor = 'pointer';
    titleTag.addEventListener('click', () => {
        localStorage.setItem('selected', opera.id);
        window.location.href = redir_link;
    });

    return article;
}
function renderPage(dataList) {
    currentDataset = dataList;
    content_container.innerHTML = '';

    const totalPages = Math.ceil(dataList.length / itemsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageItems = dataList.slice(startIndex, startIndex + itemsPerPage);

    pageItems.forEach(opera => {
        const articleNode = createOperaArticle(opera);
        content_container.appendChild(articleNode);
    });

    // Toggle button state
    btnPrev.disabled = currentPage === 1;
    btnNext.disabled = currentPage >= totalPages;
}
function AccordingToSearchBar() {
    const content = bar.value.trim().toLowerCase();

    const sortedData = [...Final].sort((a, b) => {
        const aName = a.id.toLowerCase();
        const bName = b.id.toLowerCase();

        const distA = aName.includes(content) ? -1 : levenshtein(content, aName);
        const distB = bName.includes(content) ? -1 : levenshtein(content, bName);

        return distA - distB;
    });

    return sortedData;
}
function executeSearch() {
    const searchResults = AccordingToSearchBar();

    currentPage = 1;
    renderPage(searchResults);

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
//preset All FilterStatus -> false
const filterlist = document.querySelectorAll('input[name="sort"]');
filterlist.forEach((status) => {
    if (status) status.checked = false;
});

slide_bar.addEventListener("input", () => {
    price_indicator.innerText = `price:${slide_bar.value}`;
});
const redir_link = `${FRONTEND_URL}/front-end/book/book.html`
window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        event.preventDefault();
        btnPrev.click();
    } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        btnNext.click();
    }
});

btnPrev.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderPage(currentDataset);
        page_num.innerText = `Current Page:${currentPage}`;
    }
});
btnNext.addEventListener('click', () => {
    const totalPages = Math.ceil(currentDataset.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderPage(currentDataset);
        page_num.innerText = `Current Page:${currentPage}`;
    }

});
renderPage(Final);
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
                algo_display.innerText = 'Current Algorithm implemented: merge sort';
            }
            if (section === 'time') {
                sort.insertion_time(Final);
                algo_display.innerText = 'Current Algorithm implemented: insertion sort';
            }
            if (section === 'price') {
                sort.bubble_ascending_price(Final);
                algo_display.innerText = 'Current Algorithm implemented: bubble sort';
            }
            if (section === 'rate') {
                sort.bubble_ascending_rate(Final);
                algo_display.innerText = 'Current Algorithm implemented: bubble sort';
            }
            currentPage = 1;
            renderPage(Final);
        }
    })
})
//////////////////////////////////////////////////////////////////
