// function random_generate_web() {
//     const result = crypto.randomUUID().replace(/-/g, '');
//     const tmp_local_domain = 'http://127.0.0.1:5500/auth/'
//     return `${tmp_local_domain}${result}`;
// }

// // console.log(random_generate_web());


// const result = (a, b) => {
//     return a + b
// }


// import cors from 'cors';
// import express from 'express'

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.get("/auth/:token", (req, res) => {
//     console.log("ENTERED!");
//     res.send("OK");
// });




// app.listen(3000, () => {
//     console.log(":3000,Service online,Please start.");
// });
// app.listen(5500, () => {
//     console.log(":5500,Service online,Please start.");
// });


function sub_transacID_time() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hr = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const sec = String(now.getSeconds()).padStart(2, '0');
    const result = `${yyyy}${mm}${dd}-${hr}${min}${sec}`;
    return result;
}

function generate_TransacID() {
    const prefix='tx-';
    const time=`${sub_transacID_time()}-`;
    const ID=Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${time}${ID}`
}


console.log(generate_TransacID())