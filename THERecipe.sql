CREATE TABLE User(Username text PRIMARY KEY NOT NULL,Password text NOT NULL,ProfilePicture blob);
CREATE TABLE Recipes (ID int PRIMARY KEY NOT NULL, Name text NOT NULL, Description text NOT NULL, ingredients text NOT NULL, difficulty text, picture blob, private bool);
CREATE TABLE LikedRecipes(Username text NOT NULL, RecipeID int NOT NULL,PRIMARY KEY(Username, RecipeID), FOREIGN KEY(Username) REFERENCES User(Username), FOREIGN KEY(RecipeID) REFERENCES Recipes(ID));
CREATE TABLE Comments(Username text NOT NULL, RecipeID int NOT NULL, CommentText text Not NULL,PRIMARY KEY(Username, RecipeID), FOREIGN KEY(Username) REFERENCES User(Username), FOREIGN KEY(RecipeID) REFERENCES Recipes(ID));

INSERT INTO User (Username, Password, ProfilePicture) VALUES
('john_doe', 'password123', NULL),
('jane_smith', 'securepass', NULL),
('chef_mike', 'bestcooking', NULL);

INSERT INTO Recipes (ID, Name, Description, ingredients, difficulty, picture, private) VALUES
(1, 'Spaghetti Carbonara', 'A classic Italian pasta dish with eggs, cheese, pancetta, and pepper.', 'spaghetti, eggs, pancetta, parmesan cheese, black pepper', 'Easy', NULL, FALSE),
(2, 'Vegan Pancakes', 'Delicious, fluffy vegan pancakes for breakfast.', 'flour, plant-based milk, baking powder, sugar', 'Medium', NULL, FALSE),
(3, 'Chocolate Cake', 'Rich and moist chocolate cake with creamy frosting.', 'flour, cocoa powder, sugar, eggs, butter', 'Hard', NULL, TRUE);

INSERT INTO LikedRecipes (Username, RecipeID) VALUES
('john_doe', 1),
('jane_smith', 1),
('jane_smith', 2),
('chef_mike', 3);

INSERT INTO Comments (Username, RecipeID, CommentText) VALUES
('john_doe', 1, 'Tried this last night, it was amazing!'),
('jane_smith', 1, 'A bit too salty for me, but otherwise great.'),
('jane_smith', 2, 'Loved these pancakes, super easy to make!'),
('chef_mike', 3, 'Best chocolate cake recipe I\'ve tried so far.');
