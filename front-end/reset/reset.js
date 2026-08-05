const isLocal = window.location.hostname === '127.0.0.1'
const API_BASE_URL = isLocal ? 'http://127.0.0.1:3000' : 'https://backend-sba.vercel.app';

//

const email = document.getElementById('email')
const ResetSubmit = document.getElementById('ResetSubmit')
const ProgressDisplay = document.getElementById('ProgressDisplay')

//sub-func
async function sendResetEmail(email) {
    const url = `${API_BASE_URL}/reset`;
    const data = { email: email }
    try {
        const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if (resp.ok) {
            const result = await resp.json();
            if (result.success) {
                ProgressDisplay.innerText = "Reset Email has been sent to your email"
            } else {
                ProgressDisplay.innerText = `Failed: ${result.msg}`;
            }
        }
    } catch (error) {
        console.log(error)
    }
}

//init



//main


ResetSubmit.addEventListener('submit', (event) => {
    event.preventDefault();
    const emailAddr = email.value;
    ProgressDisplay.innerText = "Sending request..."
    sendResetEmail(emailAddr);
})


