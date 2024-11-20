import express from 'express';
import db from './database.mjs';
import * as crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import authUSer from '../middleware/userAuth.mjs';
import authRole from '../middleware/adminAuth.mjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersRouter = express.Router();
const defaultImage = fs.readFileSync(path.join(__dirname, '../public/images/user.png'));

const storage = multer.memoryStorage()
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg||png|gif)$/)) {
            cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

usersRouter.post('/register', upload.single('avatar'), (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username ||!email ||!password) {
            return res.status(401).json({ message: 'All fields are required' });
        }
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        const profilePic = req.file ? req.file.buffer : defaultImage;
        
        const stmt = db.prepare('INSERT INTO Users (username, email, password, profile_pic, is_admin) VALUES (?,?,?,?,?)');
        stmt.run(username, email, hashedPassword, profilePic, 0);
        res.status(201).json({ message: 'User created' });
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
            req.session.user = { id: user.id, username: user.username, profile_pic: user.profile_pic, isAdmin: user.is_admin };
            req.session.authUSer = true;
            res.status(200).json({ message: 'Logged in successfully' });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

usersRouter.put('/userUpdate', authUSer, (req, res) => {
    try {
        const { username, email } = req.body;
        if (!username ||!email) {
            return res.status(401).json({ message: 'All fields are required' });
        }
        const stmt = db.prepare('UPDATE Users SET username = ?, email = ? WHERE id = ?');
        stmt.run(username, email, req.session.user.id);
        req.session.user.username = username;
        res.status(201).json({ message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

usersRouter.put('/passwordUpdate', authUSer, (req, res) => {
    try {
        const { newPassword, currentPassword } = req.body;
        const currHash = crypto.createHash('sha256').update(currentPassword).digest('hex');
        const fstmt = db.prepare('SELECT * FROM Users WHERE password = ?');
        const currUser = fstmt.get(currHash);

        if (!currUser) {
            return res.status(400).json({ message: 'Invalid current password' });
        } else if (!newPassword) {
            return res.status(401).json({ message: 'All fields are required' });
        }
        const hashedPassword = crypto.createHash('sha256').update(newPassword).digest('hex');
        const stmt = db.prepare('UPDATE Users SET password = ? WHERE id = ?');
        stmt.run(hashedPassword, req.session.user.id);
        res.status(201).json({ message: 'Password updated' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

usersRouter.post('/upload', authUSer, upload.single('avatar'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const stmt = db.prepare('UPDATE Users SET profile_pic = ? WHERE id = ?');
        stmt.run(req.file.buffer, req.session.user.id);
        res.status(200).json({
            message: 'Profile picture uploaded',
            imageUrl: `/users/image/${req.session.user.id}`
        });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

usersRouter.get('/image/:id', authUSer, (req, res) => {
    try {
        const stmt = db.prepare('SELECT profile_pic FROM Users WHERE id = ?');
        const user = stmt.get(req.params.id);
        if (user && user.profile_pic) {
            res.set('Content-Type', 'image/jpeg');
            res.status(200).send(Buffer.from(user.profile_pic));
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

usersRouter.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.status(200).json({ message: "Logged out" });
    });
});

usersRouter.get('/login', authUSer, (req, res) => {
    const user = {
        id: req.session.user.id,
        username: req.session.user.username,
        profile_pic: `/users/image/${req.session.user.id}`,
        isAdmin: req.session.user.isAdmin || null
    }
    res.status(200).json({ user });
    console.log("Checking..",req.session.authUSer);
});

export default usersRouter;