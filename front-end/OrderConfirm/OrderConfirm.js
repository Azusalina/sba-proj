const isLocal = window.location.hostname === '127.0.0.1'
const API_BASE_URL = isLocal ? 'http://127.0.0.1:3000' : 'https://backend-sba.vercel.app';


const orderId = localStorage.getItem('orderId');
const detailsStr = localStorage.getItem('details');
const ticketsStr = localStorage.getItem('tickets');

const sendEmailBtn = document.getElementById('SendEmail');

///
const details = JSON.parse(detailsStr);
const tickets = ticketsStr ? JSON.parse(ticketsStr) : [];

document.getElementById('display-order-id').innerText = `#${orderId}`;
document.getElementById('display-user').innerText = details.user || 'N/A';
document.getElementById('display-opera').innerText = details.opera || 'N/A';
document.getElementById('display-level').innerText = (details.level || '').toUpperCase();

document.getElementById('display-adult').innerText = `${details.adult || 0} x HK$${details.price_adult || 0}`;
document.getElementById('display-student').innerText = `${details.student || 0} x HK$${details.price_student || 0}`;
document.getElementById('display-wheelchair').innerText = `${details.wheelchair || 0} x HK$${details.price_wheelchair || 0}`;
document.getElementById('display-total').innerText = `HK$${Number(details.sum_price || 0).toFixed(2)}`;

const ticketListUl = document.getElementById('ticket-list');
if (tickets.length === 0) {
    ticketListUl.innerHTML = '<li>No tickets found.</li>';
} else {
    tickets.forEach(t => {
        const li = document.createElement('li');
        li.className = 'ticket-item';
        li.innerHTML = `
                    <span><strong>Ticket ID:</strong> ${t.ticketId}</span>
                    <span class="badge">${t.level} - ${t.seatClass2}</span>
                `;
        ticketListUl.appendChild(li);
    });
}




if (sendEmailBtn) {
    sendEmailBtn.addEventListener('click', async () => {
        const emailStatus = document.getElementById('email-status');
        emailStatus.innerText = 'Sending email, please wait...';
        emailStatus.style.color = '#e67e22';

        try {
            const resp = await fetch(`${API_BASE_URL}/SendConfirmationEmail`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: details.user,
                    orderId: orderId,
                    opera: details.opera,
                    level: details.level,
                    sum_price: details.sum_price,
                    tickets: tickets
                })
            });

            const result = await resp.json();
            if (result.msg === 'success') {
                emailStatus.innerText = 'A confirmation copy has been successfully sent to your email.';
                emailStatus.style.color = '#27ae60';
            } else if (result.msg === 'email_not_found') {
                emailStatus.innerText = 'Failed: User email address not found in database.';
                emailStatus.style.color = '#e74c3c';
            } else {
                emailStatus.innerText = 'Failed to send email. Please try again later.';
                emailStatus.style.color = '#e74c3c';
            }
        } catch (err) {
            console.error(err);
            emailStatus.innerText = 'Network error. Could not connect to server.';
            emailStatus.style.color = '#e74c3c';
        }
    });
}
