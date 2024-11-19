import express from 'express';
import Database from 'better-sqlite3';
import betterSqlite3Session from 'express-session-better-sqlite3';
import expressSession from 'express-session';
import usersRouter from './routes/users.mjs';
import recipeRouter from './routes/recipes.mjs';
import * as crypto from 'crypto';
import 'dotenv/config';

const PORT = process.env.PORT || 3000;

const app = express();
const sessDb = new Database(process.env.SESSION_DB || 'session.db');
const SqliteStore = betterSqlite3Session(expressSession, sessDb);

app.use(express.json());
app.use(express.static('public'));
const pass = crypto.randomBytes(32).toString('hex');

app.use(expressSession({
    secret: pass,
    resave: true,
    saveUninitialized: false,
    store: new SqliteStore(),
    rolling: true,
    unset: 'destroy',
    proxy: true,
    cookie: {
        maxAge: 900000,
        httpOnly: false
    }
}));

app.use('/users', usersRouter);
app.use('/recipes', recipeRouter);

app.get('/', (req, res) => {
    res.send('Recipe Application');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
});