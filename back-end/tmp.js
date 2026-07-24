function random_generate_web() {
    const result = crypto.randomUUID().replace(/-/g, '');
    const tmp_local_domain = 'http://127.0.0.1:5500/auth/'
    return `${tmp_local_domain}${result}`;
}

// console.log(random_generate_web());


const result = (a, b) => {
    return a + b
}


import cors from 'cors';
import express from 'express'

const app = express();
app.use(cors());
app.use(express.json());

app.get("/auth/:token", (req, res) => {
    console.log("ENTERED!");
    res.send("OK");
});




app.listen(3000, () => {
    console.log(":3000,Service online,Please start.");
});
app.listen(5500, () => {
    console.log(":5500,Service online,Please start.");
});