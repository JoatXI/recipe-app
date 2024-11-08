import express from 'express';
import Database from 'better-sqlite3';
import betterSqlite3Session from 'express-session-better-sqlite3'; 
import expressSession from 'express-session';
import * as crypto from 'crypto';
import fileUpload from 'express-fileupload';

const PORT = process.env.PORT || 3000;

const app = express(); 
const db = new Database('recipe.db');
const sessDb = new Database('session.db');
const SqliteStore = betterSqlite3Session(expressSession, sessDb);

app.use(express.json()); 
app.use(express.static('public'));
app.use(fileUpload());
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
        maxAge: 600000,
        httpOnly: false
    }
}));
 
app.get('/', (req, res) => {
    res.send('Recipe Application');
});

// User-related routes
app.post('/register', (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        const stmt = db.prepare('INSERT INTO Users (username, email, password, is_admin) VALUES (?, ?, ?, ?)');
        stmt.run(username, email, hashedPassword, 0);
        res.status(200).json({ message: 'User created' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

app.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        const stmt = db.prepare('SELECT * FROM Users WHERE username = ? AND password = ?');
        const user = stmt.get(username, hashedPassword);
        if (user) {
            req.session.user = { id: user.id, username: user.username, isAdmin: user.is_admin };
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

app.get('/logout', (req, res) => {
    try {
        req.session.destroy();
        res.status(200).json({ message: 'Logged out' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

app.put('/user/update', (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(403).json({ message: 'You must be logged in to update your profile' });
        }
        const { username, password } = req.body;
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        const stmt = db.prepare('UPDATE Users SET username = ?, password = ? WHERE id = ?');
        stmt.run(username, hashedPassword, req.session.user.id);
        req.session.user.username = username;
        res.status(200).json({ message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

app.post('/user/upload', (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(403).json({ message: 'You must be logged in to update your profile picture' });
        }
        if (data) {
            const {data} = req.files.className;
            const stmt = db.prepare('INSERT INTO Users (profile_picture) VALUES (?)');
            stmt.run(data);
            res.status(200).json({ message: 'Profile picture uploaded' });
        } else {
            res.status(400).json({ message: 'No profile picture provided' });
        }
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

app.get('user/image/:id', (req, res) => {
    try {
        const stmt = db.prepare('SELECT profile_picture FROM Users WHERE id =?');
        const user = stmt.get(req.params.id);
        if (user && user.profile_picture) {
            res.set('Content-Type', 'image/jpeg');
            res.send(user.profile_picture);
        } else {
            res.status(404).json({ message: 'Profile picture not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

app.delete('/user/:id', (req, res) => {
    try {
        if (!req.session.user || !req.session.user.isAdmin) {
            return res.status(401).json({ message: 'Only admin users can delete users' });
          }
          const stmt = db.prepare('DELETE FROM Users WHERE id = ?');
          stmt.run(req.params.id);
          res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

// Recipe-related routes
app.post('/recipes', (req, res) => {
    try {
        if (!req.session.user || !req.session.user.isAdmin) {
            return res.status(401).json({ message: 'Only admin users can create recipes' });
        }
        const { name, steps, description, ingredients } = req.body;
        const stmt = db.prepare('INSERT INTO Recipes (name, steps, description, ingredients, created_by) VALUES (?, ?, ?, ?, ?)');
        stmt.run(name, steps, description, ingredients, req.session.user.id);
        res.status(201).json({ message: 'Recipe created' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

app.get('/recipes', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM Recipes');
        const recipes = stmt.all();
        res.status(200).json(recipes);
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

app.put('/recipes/:id', (req, res) => {
    try {
        if (!req.session.user || !req.session.user.isAdmin) {
            return res.status(401).json({ message: 'Only admin users can edit recipes' });
        }
        const { name, steps, description, ingredients } = req.body;
        const stmt = db.prepare('UPDATE Recipes SET name = ?, steps = ?, description = ?, ingredients = ? WHERE id = ?');
        stmt.run(name, steps, description, ingredients, req.params.id);
        res.status(200).json({ message: 'Recipe updated' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

app.post('/recipes/:id/like', (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(403).json({ message: 'You must be logged in to like a recipe' });
        }
        const stmt = db.prepare('INSERT INTO LikedRecipes (user_id, recipe_id) VALUES (?, ?)');
        stmt.run(req.session.user.id, req.params.id);
        res.status(201).json({ message: 'Recipe liked' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

app.delete('/recipes/:id/like', (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(403).json({ message: 'You must be logged in to unlike a recipe' });
        }
        const stmt = db.prepare('DELETE FROM LikedRecipes WHERE user_id = ? AND recipe_id = ?');
        stmt.run(req.session.user.id, req.params.id);
        res.status(200).json({ message: 'Recipe unliked' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

app.post('/recipes/:id/comments', (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(403).json({ message: 'You must be logged in to comment on a recipe' });
        }
        const { content } = req.body;
        const stmt = db.prepare('INSERT INTO Comments (user_id, recipe_id, content, created_at) VALUES (?, ?, ?, ?)');
        stmt.run(req.session.user.id, req.params.id, content, new Date().toISOString());
        res.status(201).json({ message: 'Comment created' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

app.delete('/comments/:id', (req, res) => {
    try {
        if (!req.session.user || !req.session.user.isAdmin) {
            return res.status(401).json({ message: 'Only admin users can delete comments' });
        }
        const stmt = db.prepare('DELETE FROM Comments WHERE id = ?');
        stmt.run(req.params.id);
        res.status(200).json({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
});