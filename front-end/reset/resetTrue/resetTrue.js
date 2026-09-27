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



function validatePassword(value) {
    const errors = [];

    if (typeof value !== 'string' || value.length === 0) {
        return ['Password cannot be empty.'];
    }
    if (value.length < 8 || value.length > 64) {
        errors.push('Password must contain 8–64 characters.');
    }
    if (!/[A-Z]/.test(value)) {
        errors.push('At least one uppercase letter is required.');
    }
    if (!/[a-z]/.test(value)) {
        errors.push('At least one lowercase letter is required.');
    }
    if (!/\d/.test(value)) {
        errors.push('At least one digit is required.');
    }
    if (!/[^\w\s]/.test(value)) {
        errors.push('At least one special character is required.');
    }

    return errors;
}






form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const newPwd = pwdInput.value;
  const confirmPwd = pwdConfirmInput.value;

  if (!newPwd || !confirmPwd) {
      StatusDisplay.innerText = 'Both pwd fields are required.';
      StatusDisplay.style.color = 'red';
      return;
  }

  const errors = validatePassword(newPwd);

  if (errors.length > 0) {
      StatusDisplay.innerText = errors.join('\n');
      StatusDisplay.style.color = 'red';
      return;
  }

  if (newPwd !== confirmPwd) {
      StatusDisplay.innerText = 'Pwds do not match.';
      StatusDisplay.style.color = 'red';
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
