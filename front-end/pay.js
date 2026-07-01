const infors = document.querySelectorAll("ul li");
const confirm_btn = document.getElementById("confirm");
const test = document.getElementById("test");
let content = {};
infors.forEach((infor) => {
    let a = infor.innerText;
    let b = a.split(":");
    if (b.length == 2) {
        content[b[0].trim()] = b[1].trim();
    }
})
test.innerText = JSON.stringify(content);

