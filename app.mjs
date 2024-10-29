import express from 'express';

import Database from 'better-sqlite3';

import * as crypto from 'crypto';

import betterSqlite3Session from 'express-session-better-sqlite3';

import expressSession from 'express-session';



const PORT = process.env.PORT || 3000;



const app = express();

const db = new Database('cuisines.db');

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

});

//------------------------------Recipe API-------------------------


//
//Deletes a Recipe via RecipeID
app.delete("api/recipe/:recipeID",(req,res) =>{

    db.run(

        'DELETE FROM Recipe WHERE recipeID = ?',

        req.params.recipeID,

        function (err, result) {

            if (err){

                res.status(400).json({"error": res.message})

                return;

            }

            res.json({"message":"deleted", changes: this.changes})

    });

});


//
//Enpoint API for recipe with UserID
app.get("api/recipe/:userID", (req,res) => {

   
       
        const query = db.prepare( 'Select * from Recipes   where userID = ?');

        const result = query.all(req.params.userID)
    
        res.json(result);

});


//
//Enpoint API for recipe with recipeID
app.get("api/recipe/", (req,res) => {

   
       
    const query = db.prepare( 'Select * from recipe');

    const result = query.all(req.params.recipeID)

    res.json(result);

});


//
// Work in Progress endpoint api for creating a Recipe
app.get("api/recipe/", (req,res) => {

   
       
    const query = db.prepare( 'Select * from recipe');

    const result = query.all(req.params.recipeID)

    res.json(result);

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
//API endpoint for Getting UserData with UserID
app.get('/api/user/:userID',(req,res) =>{

   

    const query = db.prepare('Select * from User where UserID= ?');

    const result = query.all(req.params.userID)

    res.json(result);



});



//
//API endpoint for Getting UserData with User Object
app.get('/api/user/:userObject',(req,res) =>{

   

    const query = db.prepare('Select * from User where Username = ? AND password = ?');

    const result = query.all(req.params.username, req.params.password)

    res.json(result);

});



//------------------------------User API End-------------------------

//------------------------------Likes API-------------------------

//
//Enpoint api for getting all likes from a recipe
app.get("api/likes/:recipeIDObject", (req,res) => {

   
       
    const query = db.prepare( 'Select * from LikedRecipes where recipeID = ?');

    const result = query.all(req.params.recipeID)

    res.json(result);

});

//
// Work in Progress enpoint api for upserting any likes
app.get("api/likes/:recipeID", (req,res) => {

 ///
 ///

});


//
// Work in Progress endpoint api for Updating RecipeLikes
app.get("api/likes/", (req,res) => {

///
///

});


//------------------------------Likes API End-------------------------


//------------------------------recipe API-------------------------
CreateComment(comment,UserID)
DeleteComment(UserID,CommentID)
UpdateComment(UserID,CommentID)

//
// Work in Progress endpoint API for creating Comment

app.get("api/comment/", (req,res) => {

   


});


//
//Work in progress endpoint api for deleting comments
app.get("api/comment/", (req,res) => {

   


});

//
//Work in progress endpoint api for updating comment
app.get("api/comment/", (req,res) => {

   


});


//------------------------------Comment API ENd-------------------------



app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}...`);

});