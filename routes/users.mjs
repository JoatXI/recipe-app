import express from 'express';
import db from './database.mjs';
import * as crypto from 'crypto';
import fileUpload from 'express-fileupload';
import authUSer from '../middleware/userAuth.mjs';
import authRole from '../middleware/adminAuth.mjs';

const usersRouter = express.Router();
usersRouter.use(fileUpload());

usersRouter.post('/register', (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username ||!email ||!password) {
            return res.status(401).json({ message: 'All fields are required' });
        }
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        const stmt = db.prepare('INSERT INTO Users (username, email, password, is_admin) VALUES (?,?,?,?)');
        stmt.run(username, email, hashedPassword, 0);
        res.status(200).json({ message: 'User created' });
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

usersRouter.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username ||!password) {
            return res.status(401).json({ message: 'All fields are required' });
        }
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        const stmt = db.prepare('SELECT * FROM Users WHERE username = ? AND password = ?');
        const user = stmt.get(username, hashedPassword);
        if (user) {
            req.session.user = { id: user.id, username: user.username, isAdmin: user.is_admin };
            req.session.authUSer = true;
            res.status(200).json({ message: 'Logged in successfully' });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

usersRouter.put('/update', authUSer, (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username ||!password) {
            return res.status(401).json({ message: 'All fields are required' });
        }
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        const stmt = db.prepare('UPDATE Users SET username = ?, password = ? WHERE id = ?');
        stmt.run(username, hashedPassword, req.session.user.id);
        req.session.user.username = username;
        res.status(200).json({ message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

usersRouter.post('/upload', authUSer, (req, res) => {
    try {
        const {data} = req.files.className;
        if (data) {
            const stmt = db.prepare('INSERT INTO Users (profile_picture) VALUES (?)');
            stmt.run(data);
            res.status(200).json({ message: 'Profile picture uploaded' });
        } else {
            res.status(400).json({ message: 'No picture provided' });
        }
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

usersRouter.get('/image/:id', authUSer, (req, res) => {
    try {
        const stmt = db.prepare('SELECT profile_picture FROM Users WHERE id =?');
        const user = stmt.get(req.params.id);
        if (user.profile_picture) {
            res.set('Content-Type', 'image/jpeg');
            res.send(user.profile_picture);
        } else {
            res.status(404).json({ message: 'Profile picture not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

usersRouter.delete('/mod/:id', authUSer, authRole, (req, res) => {
    try {
        const stmt = db.prepare('DELETE FROM Users WHERE id = ?');
        stmt.run(req.params.id);
        res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

usersRouter.get('/dashboard', authUSer, (req, res) => {
    res.send('User Dashboard Page');
});

usersRouter.get('/admin', authUSer, authRole, (req, res) => {
    res.send('Admin Dashboard Page');
});

usersRouter.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.json({ message: "Logged out" });
    });
});

usersRouter.get('/login', authUSer, (req, res) => {
    res.json({ user: req.session.user || null });
    console.log("Checking..",req.session.authUSer);
});

export default usersRouter;