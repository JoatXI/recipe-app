async function getFavourites() {
    try {
        const res = await fetch('/recipes/favourite');
        const recipes = await res.json();

        const recipeList = document.querySelector('.recipe-list');
        recipeList.innerHTML = ''; // Clear any previous content

        if (recipes.length > 0) {
            recipes.forEach(recipe => {
                const recipeLink = document.createElement('a');
                recipeLink.href = "user-recipes.html"; 
                recipeLink.textContent = recipe.name;
                recipeLink.classList.add('recipe-link');

                const recipeItem = document.createElement('div');
                recipeItem.classList.add('recipe-item');
                recipeItem.appendChild(recipeLink);

                recipeList.appendChild(recipeItem);
            });
        } else {
            recipeList.innerHTML = '<p>No liked recipes yet. Start liking some recipes!</p>';
        }
    } catch (error) {
        alert(`Error occurred: ${error}`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    getFavourites();
});