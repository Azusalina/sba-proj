






const search=document.getElementById("main");
const bar = document.getElementById("bar");


search.addEventListener("submit",(event)=>{
    event.preventDefault();
    bar.focus();
})


window.onload = function () {
    const hist = localStorage.getItem("search_content");
    if (hist) {
        const a = JSON.parse(hist);
        bar.value = a;
    }
}






const p_indicator = document.getElementById("p_indicator");
const s_bar = document.getElementById("s_bar");

s_bar.addEventListener("input", () => {
    p_indicator.innerText = `price:${s_bar.value}`;
});