import express from 'express';
import Database from 'better-sqlite3';
import * as crypto from 'crypto';
import betterSqlite3Session from 'express-session-better-sqlite3';
import expressSession from 'express-session';

const PORT = process.env.PORT || 3000;

const app = express();
const db = new Database('cuisines.db');
const sessDb = new Database('session.db');

const SqliteStore = betterSqlite3Session(expressSession, sessDb);

app.use(express.json());

app.use(express.static('public'));

const pass = crypto.randomBytes(32).toString('hex');

app.use(expressSession({
    store: new SqliteStore(),

    secret: pass,
    resave: true,

    saveUninitialized: false,
    rolling: true,

    unset: 'destroy',
    proxy: true,

    cookie: {
        maxAge: 600000, // 600000 ms = 10 mins expiry time
        httpOnly: false // allow client-side code to access the cookie, otherwise it's kept to the HTTP messages
    }
}));

app.get('/', (req, res) => {
	res.send('Recipe Application');
});

app.get('/recipe/:name', (req, res) => {
	try {
		const stmt = db.prepare('SELECT * FROM cuisines WHERE name = ?');
		const results = stmt.all(req.params.name);
		res.json(results);
	} catch(error) {
		res.status(500).json({ error: error });
	}
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}...`);
});