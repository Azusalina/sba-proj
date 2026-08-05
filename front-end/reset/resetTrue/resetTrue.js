const isLocal = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
const API_BASE_URL = isLocal ? 'http://127.0.0.1:3000' : 'https://backend-sba.vercel.app';

const form = document.getElementById('NewPwdForm');
const pwdInput = document.getElementById('pwd');
const pwdConfirmInput = document.getElementById('pwd-confirm');
const StatusDisplay = document.getElementById('StatusDisplay');

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (!token) {
    StatusDisplay.innerText = "Error: No reset token found in URL.";
    StatusDisplay.style.color = "red";
    form.style.display = 'none';
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const newPwd = pwdInput.value;
    const confirmPwd = pwdConfirmInput.value;

    if (newPwd !== confirmPwd) {
        StatusDisplay.innerText = "Error: Passwords do not match!";
        StatusDisplay.style.color = "red";
        return;
    }
    StatusDisplay.innerText = "Updating password, please wait...";
    StatusDisplay.style.color = "black"
    const url = `${API_BASE_URL}/reset/updatepwd`;
    try {
        const resp = await fetch(url, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: token, newPwd: newPwd })
        });

        const result = await resp.json();

        if (result.success) {
            StatusDisplay.innerText = "Success! Password updated successfully. You can now login.";
            StatusDisplay.style.color = "green";
            form.reset();
        } else {
            StatusDisplay.innerText = `Failed: ${result.msg}`;
            StatusDisplay.style.color = "red";
        }
    } catch (error) {
        console.error("Update password error:", error);
        StatusDisplay.innerText = "A network error occurred. Please try again.";
        StatusDisplay.style.color = "red";
    }
});