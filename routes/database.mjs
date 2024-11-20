import Database from 'better-sqlite3';
import 'dotenv/config';

const db = new Database(process.env.DB_DBASE || 'recipe.db');

export default db;