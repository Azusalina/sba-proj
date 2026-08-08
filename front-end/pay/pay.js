const opera = document.getElementById('opera')
const showtime = document.getElementById('showtime');
const seatClass = document.getElementById('class')
const Pa = document.getElementById('Pa')
const Ps = document.getElementById('Ps')
const Pw = document.getElementById('Pw')
const Aa = document.getElementById('Aa')
const As = document.getElementById('As')
const Aw = document.getElementById('Aw')
const pSum = document.getElementById('pSum')




const ret = document.getElementById('return')
const cont = document.getElementById('continue')

//
//sub-funcs

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

//init

const BookData = JSON.parse(localStorage.getItem('details'))
window.addEventListener('DOMContentLoaded', () => {
    console.log(BookData)
    opera.innerText = BookData.opera;
    showtime.innerText = formatShowtime(BookData.showtime || BookData.time) 
    seatClass.innerText = BookData.level;
    Pa.innerText = `Adult($${BookData.price_adult}/per):`
    Aa.innerText = BookData.adult;
    Ps.innerText = `Adult($${BookData.price_student}/per):`
    As.innerText = BookData.student;
    Pw.innerText = `Adult($${BookData.price_wheelchair}/per):`
    Aw.innerText = BookData.wheelchair;
    pSum.innerText = BookData.sum_price;

})

//main
ret.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.href = '../book/book.html'
})
cont.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.href = './pay-mediator/pay-mediator.html'
})