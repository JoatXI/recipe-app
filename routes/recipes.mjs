import express from 'express';
import db from './database.mjs';
import authUSer from '../middleware/userAuth.mjs';

const recipeRouter = express.Router();

recipeRouter.get('/creator', authUSer, function (req, res) {
    try {
        const stmt = db.prepare('SELECT * FROM Recipes WHERE created_by = ?');
        const recipes = stmt.all(req.session.user.id);
        if (recipes) {
            res.status(200).json(recipes);
        } else {
            res.status(404).json({ message: 'No recipes found' });
        }
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

recipeRouter.post('/add', authUSer, (req, res) => {
    try {
        const { name, steps, description, ingredients } = req.body;
        if (!name || !steps || !description || !ingredients) {
            return res.status(401).json({ message: 'All fields are required' });
        }
        const stmt = db.prepare('INSERT INTO Recipes (name, steps, description, ingredients, created_by) VALUES (?, ?, ?, ?, ?)');
        stmt.run(name, steps, description, ingredients, req.session.user.id);
        res.status(201).json({
            message: 'Recipe created successfully!',
            recipe: { name, steps, description, ingredients }
        });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

recipeRouter.get('/cuisine/:name', authUSer, (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM Recipes WHERE name = ?');
        const recipes = stmt.get(req.params.name);
        if (recipes) {
            res.status(200).json(recipes);
        } else {
            res.status(404).json({ message: 'Recipe not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

recipeRouter.get('/food/:id', authUSer, (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM Recipes WHERE id = ?');
        const recipes = stmt.get(req.params.id);
        if (recipes) {
            res.status(200).json(recipes);
        } else {
            res.status(404).json({ message: 'Recipe not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

recipeRouter.put('/cuisine', authUSer, (req, res) => {
    try {
        const { name, steps, description, ingredients } = req.body;
        if (!name || !steps || !description || !ingredients) {
            return res.status(401).json({ message: 'All fields are required' });
        }
        const stmt = db.prepare('UPDATE Recipes SET name = ?, steps = ?, description = ?, ingredients = ? WHERE id = ?');
        stmt.run(name, steps, description, ingredients, req.session.user.id);
        res.status(200).json({ message: 'Recipe updated' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

recipeRouter.post('/favourite/:id', authUSer, (req, res) => {
    try {
        const stmt = db.prepare('INSERT INTO LikedRecipes (user_id, recipe_id) VALUES (?, ?)');
        stmt.run(req.session.user.id, req.params.id);
        res.status(201).json({ message: 'Recipe liked' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

recipeRouter.get('/favourite', authUSer, (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT r.id, r.name 
            FROM LikedRecipes lr
            JOIN Recipes r ON lr.recipe_id = r.id
            WHERE lr.user_id = ?
        `);
        const recipes = stmt.all(req.session.user.id);
        res.status(200).json(recipes);
    } catch (error) {
        res.status(500).json({ message: error });
    }
});


recipeRouter.get('/liked/:id', authUSer, (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM LikedRecipes WHERE user_id = ? AND recipe_id = ?');
        const like = stmt.get(req.session.user.id, req.params.id);
        res.status(200).json({ liked: !!like }); // Return true if liked, otherwise false
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

recipeRouter.delete('/favourite/:id', authUSer, (req, res) => {
    try {
        const stmt = db.prepare('DELETE FROM LikedRecipes WHERE user_id = ? AND recipe_id = ?');
        stmt.run(req.session.user.id, req.params.id);
        res.status(200).json({ message: 'Recipe unliked' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

recipeRouter.post('/comments/:id', authUSer, (req, res) => {
    try {
        const { content } = req.body;
        if (!content.trim()) {
            return res.status(401).json({ message: 'Content is required' });
        }
        const stmt = db.prepare('INSERT INTO Comments (user_id, recipe_id, content, created_at, username) VALUES (?, ?, ?, ?, ?)');
        stmt.run(req.session.user.id, req.params.id, content, new Date().toISOString(), req.session.user.username);
        res.status(201).json({ message: 'Comment Added' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

recipeRouter.get('/comments/:id', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM Comments WHERE recipe_id = ?');
        const comments = stmt.all(req.params.id);
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

recipeRouter.delete('/comments/:id', authUSer, (req, res) => {
    try {
        const cStmt = db.prepare('SELECT user_id FROM Comments WHERE id = ?');
        const comment = cStmt.get(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        if (comment.user_id !== req.session.user.id) {
            return res.status(401).json({ message: 'Unauthorized to delete this comment' });
        }
        const stmt = db.prepare('DELETE FROM Comments WHERE id = ?');
        stmt.run(req.params.id);

        res.status(200).json({ message: 'Comment Deleted' });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

export default recipeRouter