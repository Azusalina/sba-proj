import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import auth from './serv-auth/serv-auth.js';
import main from './serv-main/serv-main.js';
import { exec } from 'child_process';
import livereload from 'livereload';
import connectLiveReload from 'connect-livereload'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontPath = path.join(__dirname, '../front-end');

const app = express();
app.use(cors());
app.use(express.json());


if (!process.env.VERCEL) {
    const TheServer = livereload.createServer();
    TheServer.watch(frontPath)
    app.use(connectLiveReload());
    TheServer.server.once('connection', () => {
        setTimeout(() => {
            TheServer.refresh('/')
        }, 100)
    })
}

app.use(express.static(frontPath))
app.use('/', auth);
app.use('/', main);

app.get('/api/status', (req, res) => {
    res.json({ status: 'running', message: 'backend online, continue por favore.' });
});



if (!process.env.VERCEL) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        const url = `http://127.0.0.1:${port}`;
        console.log(`local service online on ${port}`);

        let cmd = '';
        if (process.platform === 'win32') {
            cmd = `start "" "${url}"`;
        } else if (process.platform === 'darwin') {
            cmd = `open "${url}`;
        } else {
            cmd = `xdg-open "${url}"`;
        }

        exec(cmd, (err) => {
            if (err) {
                console.error(err);
            }
        })
    })
}

export default app;