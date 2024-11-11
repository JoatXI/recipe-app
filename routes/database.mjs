import Database from 'better-sqlite3';

const db = new Database('recipe.db');

export default db;