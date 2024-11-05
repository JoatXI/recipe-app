import express from 'express';
 
import Database from 'better-sqlite3';
 
import * as crypto from 'crypto';
 
import betterSqlite3Session from 'express-session-better-sqlite3';
 
import expressSession from 'express-session';
 
 
 
const PORT = process.env.PORT || 3000;
 
 
 
const app = express();
 
const db = new Database('THERecipe.db');
 
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
    res.send(req.body);
});
 
//------------------------------Recipe API-------------------------
 
 
//
//Deletes a Recipe via RecipeID
app.delete("/api/recipe/:recipeID",(req,res) =>{
 
    const query1 = db.prepare( 'DELETE FROM LikedRecipes WHERE RecipeID  = ?');
    const result1 = query1.run(req.params.recipeID)
   const query2 = db.prepare( 'DELETE FROM Comments WHERE RecipeID  = ?');
    const result2 = query2.run(req.params.recipeID);
     const query3 = db.prepare( 'DELETE FROM Recipes WHERE id = ?');
 
     const result3 = query3.run(req.params.recipeID);
 
   res.send('Success');
 
   
 
});
 
 
//
//Enpoint API for recipe with UserID
app.get("/api/recipe/user/:userID", (req,res) => {
 
   
       
        const query = db.prepare( 'Select * from Recipes   where userID = ?');
 
        const result = query.all(re.params)
   
        res.json(result);
 
});
 
 
//
//Enpoint API for recipe with recipeID
app.get("/api/recipe/:recipeID", (req,res) => {
 
   
    const stmt = db.prepare('SELECT * FROM recipes where id = ?');
 
        const results = stmt.all(req.params.recipeID);
 
        res.json(results);
 
});
 
 
//
// endpoint api for creating a Recipe
app.post('/api/recipe/', (req, res) => {
 
    res.send(req.body);
 
  });
 
 
 
//------------------------------Recipe API End-------------------------
 
 
 
 
 
 
//
// What porpuse has this?
app.get('/recipe/:name', (req, res) => {
 
    try {
 
        const stmt = db.prepare('SELECT * FROM cuisines WHERE name = ?');
 
        const results = stmt.all(req.params.name);
 
        res.json(results);
 
    } catch(error) {
 
        res.status(500).json({ error: error });
 
       
 
    }
 
});
 
 
 
//------------------------------User API-------------------------
 
 
 
 
//
//API endpoint for Getting UserData with username
app.get('/api/user/:username',(req,res) =>{
 
   
 
    const query = db.prepare('Select * from User where username= ?');
 
    const result = query.all(req.params.username);
 
    res.json(result);
 
 
 
});
 
 
 
//
//API endpoint for Getting UserData with User Object
app.get('/api/user/',(req,res) =>{
 
   
 
    const query = db.prepare('Select * from User where Username = ? AND password = ?');
 
    const result = query.all(req.body.username, req.body.password)
 
    res.json(result);
 
});
 
 
 
//------------------------------User API End-------------------------
 
//------------------------------Likes API-------------------------
 
//
//Enpoint api for getting all likes from a recipe
app.get("/api/likes/:recipeID", (req,res) => {
 
   
       
    const query = db.prepare( 'Select * from LikedRecipes where recipeID = ?');
 
    const result = query.all(req.params.recipeID)
 
    res.json(result);
 
});
 
//
// enpoint api for upserting any likes
app.post("/api/likes/", (req,res) => {
 
 
        const {Username,RecipeID} = req.body;
   
        db.query('INSERT INTO likedrecipes (Username,RecipeID) VALUES (?, ? )', [Username,RecipeID], (err, result) => {
         
            if (err) throw err;
            res.json({ message: 'Recipe added successfully', id: result.insertId });
       
        });
      });
 
 
 
 
//
// Work in Progress endpoint api for Updating RecipeLikes
 
  app.put('/api/recipe/update/:recipeID', (req, res) => {
    const currentLike = req.body.likes;
    const newLikes = currentLike + 1;
    db.query('UPDATE likedrecipes SET likes = ? WHERE recipeId = ?', [newLikes, req.params.recipeID], (err) => {
      if (err) throw err;
      res.json({ message: 'Recipe likes updatedsuccessfully' });
    });
  });
 
 
 
 
//------------------------------Likes API End-------------------------
 
 
//------------------------------recipe API-------------------------
 
 
//
// Work in Progress endpoint API for creating Comment
 
app.get("/api/comment/update/", (req,res) => {
 
 
 
      const stmt = db.prepare('Create Comments (username, recipeid, commenttext) values (?,?,?)');
      const result = stmt.all(req.body.username,req.body.recipeID,req.body.commentText);
 
      res.send('Inserted Comment succesfully');
   
     
   
 
 
});
 
 
//
//Work in progress endpoint api for deleting comments
app.get("/api/comment/:recipeID", (req,res) => {
 
 
const query = db.prepare('Select * from Comments where RecipeID = ?' );
const result = query.all(req.params.recipeID);
   
res.json(result);
 
 
});
 
//
//Work in progress endpoint api for updating comment
//app.get("api/comment/", (req,res) => {
 
   
 
 
//});
 
 
//------------------------------Comment API ENd-------------------------
 
 
 
app.listen(PORT, () => {
 
    console.log(`Server running on port ${PORT}...`);
 
});