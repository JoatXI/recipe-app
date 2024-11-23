import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import usersRouter from '../routes/users.mjs';
import recipeRouter from '../routes/recipes.mjs';

// database mock
jest.mock('../routes/database.mjs', () => ({
    prepare: jest.fn().mockReturnValue({
        run: jest.fn(),
        get: jest.fn()
    })
}));

import db from '../routes/database.mjs';

const app = express();
app.use(express.json());

app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use('/users', usersRouter);
app.use('/recipes', recipeRouter);

describe('Users Router', () => {
    let testUser;
    let testRecipe;

    beforeEach(() => {
        jest.clearAllMocks();
        
        testUser = {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            profile_pic: Buffer.from('test image'),
            is_admin: 0
        };

        testRecipe = {
            id: 1,
            name: 'Test Recipe',
            steps: 'Test Steps',
            description: 'Test description',
            ingredients: 'Test ingredients'
        };

        db.prepare = jest.fn().mockReturnValue({
            run: jest.fn().mockReturnValue({}),
            get: jest.fn().mockReturnValue(testUser),
            all: jest.fn().mockReturnValueOnce(testRecipe)
        });
    });

    describe('POST /users/register', () => {
        it('should successfully register a new user', async () => {
            const response = await request(app)
                .post('/users/register')
                .field('username', testUser.username)
                .field('email', testUser.email)
                .field('password', testUser.password)
                .expect(201);

            expect(response.body.message).toBe('User created');
        });

        it('should return 401 if required fields are missing', async () => {
            const response = await request(app)
                .post('/users/register')
                .field('username', testUser.username)
                .expect(401);

            expect(response.body.message).toBe('All fields are required');
        });
    });

    describe('POST /users/login', () => {
        it('should login user with correct credentials', async () => {
            const response = await request(app)
                .post('/users/login')
                .send({
                    username: testUser.username,
                    password: testUser.password
                })
                .expect(200);

            expect(response.body.message).toBe('Logged in successfully');
        });

        it('should return 401 for invalid credentials', async () => {
            db.prepare().get.mockReturnValueOnce(null);
            
            const response = await request(app)
                .post('/users/login')
                .send({
                    username: 'wronguser',
                    password: 'wrongpassword'
                })
                .expect(401);

            expect(response.body.message).toBe('Invalid username or password');
        });
    });

    describe('PUT /users/userUpdate', () => {
        it('should update user profile', async () => {
            const agent = request.agent(app);
            await agent.post('/users/login').send({ username: testUser.username, password: testUser.password });

            const response = await agent
                .put('/users/userUpdate')
                .send({
                    username: 'newusername',
                    email: 'new@example.com'
                })
                .expect(201);

            expect(response.body.message).toBe('Profile updated');
        });

        it('should return 401 if fields are missing', async () => {
            const agent = request.agent(app);
            await agent.post('/users/login').send({ username: testUser.username, password: testUser.password });

            const response = await agent
                .put('/users/userUpdate')
                .send({ username: 'newusername' })
                .expect(401);

            expect(response.body.message).toBe('All fields are required');
        });
    });

    describe('PUT /users/passwordUpdate', () => {
        it('should update user password', async () => {
            const agent = request.agent(app);
            await agent.post('/users/login').send({ username: testUser.username, password: testUser.password });

            const response = await agent
                .put('/users/passwordUpdate')
                .send({
                    currentPassword: 'oldpassword',
                    newPassword: 'newpassword'
                })
                .expect(201);

            expect(response.body.message).toBe('Password updated');
        });

        it('should return 400 for invalid current password', async () => {
            const agent = request.agent(app);
            await agent.post('/users/login').send({ username: testUser.username, password: testUser.password });

            db.prepare().get.mockReturnValueOnce(null);

            const response = await agent
                .put('/users/passwordUpdate')
                .send({
                    currentPassword: 'wrongpassword',
                    newPassword: 'newpassword'
                })
                .expect(400);

            expect(response.body.message).toBe('Invalid current password');
        });
    });

    describe('POST /users/upload', () => {
        it('should upload profile picture', async () => {
            const agent = request.agent(app);
            await agent.post('/users/login').send({ username: testUser.username, password: testUser.password });

            const response = await agent
                .post('/users/upload')
                .attach('avatar', Buffer.from('test image'), { 
                    filename: 'test.jpg', 
                    contentType: 'image/jpeg' 
                })
                .expect(200);

            expect(response.body.message).toBe('Profile picture uploaded');
        });

        it('should return 400 if no file uploaded', async () => {
            const agent = request.agent(app);
            await agent.post('/users/login').send({ username: testUser.username, password: testUser.password });

            const response = await agent
                .post('/users/upload')
                .expect(400);

            expect(response.body.message).toBe('No file uploaded');
        });
    });

    describe('GET /recipes/creator', () => {
        it('should return 200 when recipes are found for a user', async () => {
            db.prepare().all.mockReturnValueOnce();
        
            const agent = request.agent(app);
            await agent.post('/users/login').send({ username: testUser.username, password: testUser.password });
        
            const response = await agent
                .get('/recipes/creator')
                .expect(200);
        
            expect(response.body).toEqual(testRecipe);
            expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM Recipes WHERE created_by = ?');
            expect(db.prepare().all).toHaveBeenCalledWith(testUser.id);
        });
    });

    describe('POST /recipes/comments/:id', () => {
        it('should create a new user comment for a recipe', async () => {
            db.prepare().run.mockReturnValueOnce();
        
            const agent = request.agent(app);
            await agent.post('/users/login').send({ username: testUser.username, password: testUser.password });
        
            const response = await agent
                .post(`/recipes/comments/${testRecipe.id}`)
                .send({ content: 'Test Comment' })
                .expect(201);
        
            expect(response.body.message).toBe('Comment Added');
            expect(db.prepare).toHaveBeenCalledWith('INSERT INTO Comments (user_id, recipe_id, content, created_at, username) VALUES (?, ?, ?, ?, ?)');
        });

        it('should return 403 if user is not logged in', async () => {
            db.prepare().run.mockReturnValueOnce();

            const agent = request.agent(app);
            const response = await agent
                .post(`/recipes/comments/${testRecipe.id}`)
                .send({ content: 'Test Comment' })
                .expect(403);

            expect(response.body.message).toBe('Unauthorized access! You need to sign in');
        });
    });

    describe('DELETE /recipes/comments/:id', () => {
        it('should return 401 when trying to delete a comment made by another user', async () => {
            const testCommentId = 1;
        
            const agent = request.agent(app);
            await agent.post('/users/login').send({ username: testUser.username, password: testUser.password });
        
            const response = await agent
                .delete(`/recipes/comments/${testCommentId}`)
                .expect(401);
        
            expect(response.body.message).toBe('Unauthorized to delete this comment');
            expect(db.prepare).toHaveBeenCalledWith('SELECT user_id FROM Comments WHERE id = ?');
        });

        it('should delete a comment made by the user', async () => {
            const testCommentId = 1;
            db.prepare().get.mockReturnValueOnce(testUser.id);

            const agent = request.agent(app);
            await agent.post('/users/login').send({ username: testUser.username, password: testUser.password });

            const response = await agent
                .delete(`/recipes/comments/${testCommentId}`)
                .expect(200);
                
            expect(response.body.message).toBe('Comment Deleted');
        });
    });

    describe('POST /users/logout', () => {
        it('should logout user', async () => {
            const response = await request(app)
                .post('/users/logout')
                .expect(200);

            expect(response.body.message).toBe('Logged out');
        });
    });
});