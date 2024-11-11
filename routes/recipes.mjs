import express from 'express';
import db from './database.mjs';
import authUSer from '../middleware/userAuth.mjs';
import authRole from '../middleware/adminAuth.mjs';

const recipeRouter = express.Router();

recipeRouter.get('/creator', function (req, res) {
    try {
        const stmt = db.prepare('SELECT * FROM Recipes WHERE created_by = ?');
        const recipes = stmt.all();
        res.status(200).json(recipes);
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

recipeRouter.post('/recipes/:uid', authUSer, authRole, (req, res) => {
    try {
        const { name, steps, description, ingredients } = req.body;
        const stmt = db.prepare('INSERT INTO Recipes (name, steps, description, ingredients, created_by) VALUES (?, ?, ?, ?, ?)');
        stmt.run(name, steps, description, ingredients, req.params.uid);
        res.status(201).json({ message: 'Recipe created' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

recipeRouter.get('/cuisine', authUSer, (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM Recipes');
        const recipes = stmt.all();
        res.status(200).json(recipes);
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

recipeRouter.put('/cuisine/:id', authUSer, (req, res) => {
    try {
        const { name, steps, description, ingredients } = req.body;
        const stmt = db.prepare('UPDATE Recipes SET name = ?, steps = ?, description = ?, ingredients = ? WHERE id = ?');
        stmt.run(name, steps, description, ingredients, req.params.id);
        res.status(200).json({ message: 'Recipe updated' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

recipeRouter.get('/favourite/:uid', function (req, res) {
    try {
        const stmt = db.prepare('SELECT * FROM LikedRecipes WHERE user_id = ?');
        const recipes = stmt.run(req.params.uid);
        res.status(200).json(recipes);
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

recipeRouter.post('/favourite/:id/:uid', authUSer, (req, res) => {
    try {
        const stmt = db.prepare('INSERT INTO LikedRecipes (user_id, recipe_id) VALUES (?, ?)');
        stmt.run(req.params.id, req.params.uid);
        res.status(201).json({ message: 'Recipe liked' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

recipeRouter.delete('/favourite/:id/:uid', authUSer, (req, res) => {
    try {
        const stmt = db.prepare('DELETE FROM LikedRecipes WHERE user_id = ? AND recipe_id = ?');
        stmt.run(req.params.id, req.params.uid);
        res.status(200).json({ message: 'Recipe unliked' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

recipeRouter.post('/comments/:id/:uid', authUSer, (req, res) => {
    try {
        const { content } = req.body;
        const stmt = db.prepare('INSERT INTO Comments (user_id, recipe_id, content, created_at) VALUES (?, ?, ?, ?)');
        stmt.run(req.params.id, req.params.uid, content, new Date().toISOString());
        res.status(201).json({ message: 'Comment Added' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

recipeRouter.delete('/comments/:id', authUSer, (req, res) => {
    try {
        const stmt = db.prepare('DELETE FROM Comments WHERE id = ?');
        stmt.run(req.params.id);
        res.status(200).json({ message: 'Comment Deleted' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

export default recipeRouter