
const gen_gift_card = document.getElementById('gen-gift-card')
const gift_amount = document.getElementById('gift-amount')
//sub-funcs

function generateCode() {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const getChar = () => chars[Math.floor(Math.random() * chars.length)];
    const getBlock = () => getChar() + getChar() + getChar() + getChar();
    return getBlock() + "-" + getBlock() + "-" + getBlock();
}


//main
window.addEventListener('DOMContentLoaded',()=>{
    gift_amount.value=""
    gift_amount.blur();
})


gen_gift_card.addEventListener('click', async (event) => {
    event.preventDefault();
    if (!gift_amount.value || Number(gift_amount.value) <= 0) {
        alert("Please enter a valid gift card amount.");
        return;
    }
    const value = Number(gift_amount.value)
    const code = generateCode();
    const url = 'http://127.0.0.1:3000/toolkit/gen_redeem_code'
    const data = { code: code, value: value }
    try {
        const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body:JSON.stringify(data)
        });
        if(resp.ok){
            const result=await resp.json();
            if(result.msg==='success'){
                window.prompt(`Gift card with value $${value}. Use Ctrl+C or Cmd+C to copy:`, code);
            }else{
                alert('unknown error')
            }
        }
    } catch (error) {
        alert(error)
    }
})