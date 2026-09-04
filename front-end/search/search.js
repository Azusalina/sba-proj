import * as sort from './sort.js'
//#region

const isLocal = window.location.hostname === '127.0.0.1'
const API_BASE_URL = isLocal ? 'http://127.0.0.1:3000' : 'https://backend-sba.vercel.app';
const FRONTEND_URL = isLocal ? 'http://127.0.0.1:5500' : 'https://frontend-sba.vercel.app'


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
const algo_display = document.getElementById("algo-display");
const time_display = document.getElementById('time-display')
//
//#endregion

const FilterStatusList = [FilterStatus_name, FilterStatus_price, FilterStatus_time, FilterStatus_rate]
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//sub-functions
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
        return result;
    } catch (error) {
        console.log(error);
    }
}
async function ReqOperaData() {
    const operaResult = await updateOperaData();
    if (operaResult?.status && Array.isArray(operaResult.data)) {
        return operaResult.data.map(opera => ({
            id: opera.id,
            name: opera.name,
            duration: opera.duration,
            rate: Number(opera.rate),
            plans: opera.plans
        }));
    }
    return [];
}

function createOperaArticle(opera) {
    const article = document.createElement('article');
    article.id = opera.id;

    const currentPlan = opera.plans[0];

    article.innerHTML = `
    <img src="placeholder.png">
    <div class="info_container">
        <h1 data-id="${opera.id}">${opera.name}</h1>
        <label class="price">Budget Price: $${currentPlan.budget}</label>
        <label class="rate">Rate: ${opera.rate}/10</label>
        
        <div class="time-hover-container">
            <label class="time">Show Time: <span class="time-text">${formatShowtime(currentPlan.time)}</span></label>
            <ul class="time-dropdown">
                <li data-priceid="${opera.plans[0].price_id}" data-time="${opera.plans[0].time}" data-budget="${opera.plans[0].budget}">
                    Case I: ${formatShowtime(opera.plans[0].time)} (Plan ${opera.plans[0].price_id})
                </li>
                <li data-priceid="${opera.plans[1].price_id}" data-time="${opera.plans[1].time}" data-budget="${opera.plans[1].budget}">
                    Case II: ${formatShowtime(opera.plans[1].time)} (Plan ${opera.plans[1].price_id})
                </li>
            </ul>
        </div>
        
        <label class="duration">Duration: ${opera.duration} min</label>
    </div>
`;

    const titleTag = article.querySelector('h1');
    titleTag.style.cursor = 'pointer';
    titleTag.addEventListener('click', () => {
        localStorage.setItem('selected', opera.id);
        localStorage.setItem('selected_price_id', currentPlan.price_id);
        localStorage.setItem('selected_time', currentPlan.time);
        window.location.href = '../book/book.html';
    });

    const timeItems = article.querySelectorAll('.time-dropdown li');
    timeItems.forEach(li => {
        li.addEventListener('click', (e) => {
            e.stopPropagation();
            const selectedPriceId = e.target.getAttribute('data-priceid');
            const selectedTime = e.target.getAttribute('data-time');
            const selectedBudget = e.target.getAttribute('data-budget');
            article.querySelector('.price').innerText = `Budget Price: $${selectedBudget}`;
            article.querySelector('.time-text').innerText = formatShowtime(selectedTime);
            currentPlan.price_id = selectedPriceId;
            currentPlan.time = selectedTime;
            currentPlan.budget = selectedBudget;

            const dropdown = article.querySelector('.time-dropdown');
            dropdown.style.display = 'none';
            setTimeout(() => { dropdown.style.display = ''; }, 200);
        });
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
