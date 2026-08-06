//database:
import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;


//local
const pool = new Pool({
    user: 'a_sql',
    host: 'localhost',
    database: 'my_dev_db',
    password: 'a',
    port: 5432,
});

pool.connect()
    .then(client => {
        console.log("Connected to Database , success");
        client.release();
    })
    .catch(err => console.error("Database Connection Error:", err.message));







export default pool;
