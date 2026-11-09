const opera = document.getElementById('opera')
const showtime = document.getElementById('showtime');
const seatList = document.getElementById('seat-list')
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
    if (!BookData || !Array.isArray(BookData.seats)) {
        window.location.href = '../book/book.html'
        return;
    }
    opera.innerText = BookData.opera;

    showtime.innerText = formatShowtime(BookData.showtime);
    BookData.seats.forEach(seat => {
        const item = document.createElement('li');
        //how many times ive written this sentence today-09.11.2026
        item.textContent = `${seat.label}-${seat.zone}-${seat - audience}-HK$${Number(seat.price).toFixed(2)}`
        seatList.appendChild(item)
    });
    pSum.innerText = `HK$${Number(BookData.sum_price).toFixed(2)}`;


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