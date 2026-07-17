/*
==========================================================
                    search.js
                    Part 1 / 2
==========================================================
Controller

Responsible for

- Fetch Data
- Search
- Filter
- Render
- Event Binding
- Queue / Stack / Linked List Controller

Sorting algorithms are implemented in sort.js

==========================================================
*/

/* ==========================================================
                        Global
========================================================== */

let operaData = [];

let filteredData = [];

/*
Queue
*/
let queue = loadQueue(10);

/*
Stack
*/
let viewedStack = loadViewStack(20);

/*
Linked List
*/
let recommendList = loadRecommendation();

/*
Default Recommendation
*/
if(recommendList.isEmpty()){

    recommendList.append("La Bohème");
    recommendList.append("Turandot");
    recommendList.append("Madama Butterfly");
    recommendList.append("Rigoletto");

    saveRecommendation(recommendList);

}

/* ==========================================================
                    Algorithm Information
========================================================== */

const algorithmInfo={

    name:"None",

    complexity:"-",

    time:"0 ms"

};

/* ==========================================================
                    DOM Reference
========================================================== */

const resultContainer=
document.getElementById("result_container");

const resultCount=
document.getElementById("result_count");

const searchForm=
document.getElementById("search_form");

const searchInput=
document.getElementById("search_input");

const priceSlider=
document.getElementById("price_slider");

const priceIndicator=
document.getElementById("price_indicator");

const ratingSelect=
document.getElementById("rating_select");

const sortType=
document.getElementById("sort_type");

const applyButton=
document.getElementById("apply_button");

const resetButton=
document.getElementById("reset_button");

const algorithmName=
document.getElementById("algorithm_name");

const algorithmComplexity=
document.getElementById("algorithm_complexity");

const algorithmTime=
document.getElementById("algorithm_time");

const algorithmStatus=
document.getElementById("current_algorithm");

/* ==========================================================
                    Initialize
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    initialize

);

async function initialize(){

    await fetchOpera();

    bindEvent();

    updateResult();

    renderQueue();

    renderViewHistory();

    renderRecommendation();

}

/* ==========================================================
                    Fetch Opera
========================================================== */

async function fetchOpera(){

    /*
    Future Backend

    const response=

    await fetch(
    "http://localhost:3000/search"
    );

    operaData=
    await response.json();

    */

    operaData=[

        {

            id:1,

            title:"Carmen",

            venue:"Hong Kong Cultural Centre",

            date:"2026-07-14",

            rating:4.8,

            price:280,

            available:true,

            poster:"../foto for searchhtml/A.jpg",

            seat:[

                "Budget",

                "Standard Low",

                "Premium"

            ]

        },

        {

            id:2,

            title:"Aida",

            venue:"Hong Kong City Hall",

            date:"2026-07-21",

            rating:4.4,

            price:380,

            available:true,

            poster:"../foto for searchhtml/A.jpg",

            seat:[

                "Budget",

                "Premium"

            ]

        },

        {

            id:3,

            title:"Die Zauberflöte",

            venue:"HKAPA",

            date:"2026-07-30",

            rating:4.9,

            price:250,

            available:false,

            poster:"../foto for searchhtml/A.jpg",

            seat:[

                "Standard High",

                "Premium"

            ]

        }

    ];

    filteredData=[...operaData];

}

/* ==========================================================
                    Event Binding
========================================================== */

function bindEvent(){

    searchForm.addEventListener(

        "submit",

        function(e){

            e.preventDefault();

            performSearch();

        }

    );

    applyButton.addEventListener(

        "click",

        updateResult

    );

    resetButton.addEventListener(

        "click",

        resetFilter

    );

    priceSlider.addEventListener(

        "input",

        function(){

            priceIndicator.innerHTML=

            "HK$0 - HK$"+

            priceSlider.value;

        }

    );

}

/* ==========================================================
                    Search
========================================================== */

function performSearch(){

    const keyword=

    searchInput.value

    .trim()

    .toLowerCase();

    queue.enqueue(keyword);

    saveQueue(queue);

    renderQueue();

    filteredData=

    operaData.filter(opera=>{

        return(

            opera.title
            .toLowerCase()
            .includes(keyword)

            ||

            opera.venue
            .toLowerCase()
            .includes(keyword)

        );

    });

    updateResult();

}

/* ==========================================================
                    Update Result
========================================================== */

function updateResult(){

    let data=[...filteredData];

    data=applyAllFilters(data);

    data=sortController(data);

    renderCards(data);

}

/* ==========================================================
                Apply All Filters
========================================================== */

function applyAllFilters(data){

    /* ---------- Price ---------- */

    const maxPrice=

    parseInt(priceSlider.value);

    data=data.filter(opera=>{

        return opera.price<=maxPrice;

    });

    /* ---------- Rating ---------- */

    const rating=

    parseInt(

        ratingSelect.value

    );

    if(rating>0){

        data=data.filter(opera=>{

            return opera.rating>=rating;

        });

    }

    /* ---------- Availability ---------- */

    const availability=

    document.querySelector(

        "input[name='availability']:checked"

    ).value;

    if(availability==="available"){

        data=data.filter(opera=>{

            return opera.available;

        });

    }

    else if(availability==="sold"){

        data=data.filter(opera=>{

            return !opera.available;

        });

    }

    return data;

}

/* ==========================================================
                Sorting Controller
========================================================== */

function sortController(data){

    const begin=performance.now();

    switch(sortType.value){

        case "price":

            algorithmInfo.name="Merge Sort";
            algorithmInfo.complexity="O(n log n)";
            data=mergeSort(data,"price");
        break;

        case "name":

            algorithmInfo.name="Selection Sort";
            algorithmInfo.complexity="O(n²)";
            data=selectionSort(data,"title");
        break;

        case "rating":

            algorithmInfo.name="Bubble Sort";
            algorithmInfo.complexity="O(n²)";
            data=bubbleSort(data,"rating");
        break;

        case "date":

            algorithmInfo.name="Insertion Sort";
            algorithmInfo.complexity="O(n²)";
            data=insertionSort(data,"date");
        break;

    }

    const end=performance.now();

    algorithmInfo.time=

    (end-begin).toFixed(3)

    +" ms";

    updateAlgorithmPanel();

    return data;

}

/* ==========================================================
                Render Cards
========================================================== */

function renderCards(data){

    resultContainer.innerHTML="";

    resultCount.innerHTML=

    data.length+" Results";

    data.forEach(opera=>{

        resultContainer.appendChild(

            createCard(opera)

        );

    });

}

function createCard(opera){

    const card=

    document.createElement("article");

    card.className="opera_card";

    card.innerHTML=`

        <img
        class="opera_poster"
        src="${opera.poster}"
        alt="${opera.title}">

        <div class="opera_information">

            <h2 class="opera_title">

                ${opera.title}

            </h2>

            <p class="opera_venue">

                ${opera.venue}

            </p>

            <p class="opera_date">

                ${opera.date}

            </p>

            <p class="opera_rating">

                ★ ${opera.rating}

            </p>

            <div class="seat_tags">

                ${renderSeat(opera.seat)}

            </div>

            <p class="opera_price">

                HK$ ${opera.price}

            </p>

        </div>

        <div class="opera_action">

            <button class="detail_btn">

                Details

            </button>

            <button class="book_btn">

                Book Now

            </button>

        </div>

    `;

    card.querySelector(

        ".detail_btn"

    ).addEventListener(

        "click",

        function(){

            viewedStack.push(opera);

            saveViewStack(viewedStack);

            renderViewHistory();

        }

    );

    card.querySelector(

        ".book_btn"

    ).addEventListener(

        "click",

        function(){

            location.href=

            "../book/book.html";

        }

    );

    return card;

}

function renderSeat(list){

    return list.map(item=>{

        let cls="budget";

        if(item==="Standard Low") cls="low";
        if(item==="Standard High") cls="high";
        if(item==="Premium") cls="premium";

        return `

        <span class="seat ${cls}">

            ${item}

        </span>

        `;

    }).join("");

}

/* ==========================================================
                Queue
========================================================== */

function renderQueue(){

    const ul=

    document.getElementById(

        "recent_search_list"

    );

    ul.innerHTML="";

    queue.toArray().forEach(item=>{

        const li=

        document.createElement("li");

        li.textContent=item;

        ul.appendChild(li);

    });

}

/* ==========================================================
                Stack
========================================================== */

function renderViewHistory(){

    const ul=

    document.getElementById(

        "recent_view_list"

    );

    ul.innerHTML="";

    viewedStack

    .toArray()

    .slice()

    .reverse()

    .forEach(opera=>{

        const li=

        document.createElement("li");

        li.textContent=

        opera.title;

        ul.appendChild(li);

    });

}

/* ==========================================================
            Recommendation
========================================================== */

function renderRecommendation(){

    const ul=

    document.getElementById(

        "recommendation_list"

    );

    ul.innerHTML="";

    recommendList

    .toArray()

    .forEach(item=>{

        const li=

        document.createElement("li");

        li.textContent=item;

        ul.appendChild(li);

    });

}

/* ==========================================================
            Algorithm Panel
========================================================== */

function updateAlgorithmPanel(){

    algorithmName.textContent=

    algorithmInfo.name;

    algorithmComplexity.textContent=

    algorithmInfo.complexity;

    algorithmTime.textContent=

    algorithmInfo.time;

    algorithmStatus.textContent=

    algorithmInfo.name;

}

/* ==========================================================
                Reset
========================================================== */

function resetFilter(){

    searchInput.value="";

    priceSlider.value=3000;

    priceIndicator.textContent=

    "HK$0 - HK$3000";

    ratingSelect.selectedIndex=0;

    document.querySelector(

        "input[value='all']"

    ).checked=true;

    filteredData=[...operaData];

    updateResult();

}

/* ==========================================================
                    END
========================================================== */