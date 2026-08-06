import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import auth from './serv-auth/serv-auth.js';
import main from './serv-main/serv-main.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: "running", message: "backend server's online, please continue." });
});

app.use('/', auth);
app.use('/', main);

if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Local service online on http://127.0.0.1:${PORT}`);
    });
}

export default app;