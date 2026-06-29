
const search = document.getElementById("search_content");
const search_btn = document.getElementById("s_Btn")



search_btn.onclick = function (event){
    event.preventDefault();
    let a = search.value;
    localStorage.setItem("search_content", JSON.stringify(a));
    window.location.href = 'search.html';
}