const isLocal = window.location.hostname === '127.0.0.1'
const API_BASE_URL = isLocal ? 'http://127.0.0.1:3000' : 'https://backend-sba.vercel.app';


const search = document.getElementById("search_content");
const search_btn = document.getElementById("s_Btn")

const authBtn = document.getElementById('authBtn')
const logoutBtn = document.getElementById('logoutBtn')


const dev = document.getElementById('dev')
//sub-func
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function dev_pwd(event) {
    event.preventDefault();
    const pwd = prompt('pwd for entering dev page:');
    if (pwd === 'aaaa') {
        window.location.href = './toolkit/toolkit.html'
    } else {
        alert('you do not have access to developer page yet, contact admin for more details')
    }

}


//init


document.addEventListener('DOMContentLoaded', () => {
    const authBtn = document.getElementById('authBtn');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === null) {
        localStorage.setItem('isLoggedIn', 'false');
    }
    if (isLoggedIn === 'true') {
        authBtn.innerText = 'Settings';
        authBtn.href = './settings/settings.html';
    }
});
//main



search_btn.onclick = function (event) {
    event.preventDefault();
    let a = search.value;
    localStorage.setItem("search_content", a);
    window.location.href = './search/search.html';
}


logoutBtn.onclick = function (e) {
    e.preventDefault();
    logout();
}

