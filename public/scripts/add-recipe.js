
document.getElementById("add-rep").addEventListener("click", async () => {
    const recipeName = document.getElementById("rep-name").value.trim();
    const recipeSteps = document.getElementById("rep-steps").value.trim();
    const recipeDescription = document.getElementById("rep-desc").value.trim();
    const recipeIngredients = document.getElementById("rep-ing").value.trim();

    if (!recipeName || !recipeSteps || !recipeDescription || !recipeIngredients) {
        alert("All fields are required!");
        return;
    }

    try {
        const res = await fetch(`/recipes/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: recipeName,
                steps: recipeSteps,
                description: recipeDescription,
                ingredients: recipeIngredients,
            }),
        });

        const data = await res.json();

        if (res.status == 201) {
            const myRecipes = document.getElementById("my-recipes");
            
            const recipeDiv = document.createElement("div");
            recipeDiv.classList.add("recipeList");
            
            recipeDiv.innerHTML = `
            <h3>${recipeName}</h3>
            <p>${recipeDescription}</p>
            <h3>Steps</h3>
            <p>${recipeSteps}</p>
            <h3>Ingredients</h3>
            <p>${recipeIngredients}</p>
            `;
            myRecipes.prepend(recipeDiv);
            recipeName.value = '';
            recipeSteps.value = '';
            recipeDescription.value = '';
            recipeIngredients.value = '';

            alert(data.message);

        } else if (res.status == 403) {
            alert("You need to login to add a recipe");
        } else {
            alert("Failed to add recipe");
        }
    } catch (error) {
        alert(`Error occurred: ${error}`);
    }
});

async function loadRecipe() {
    try {
        const res = await fetch(`/recipes/creator`)
        const recipeList = await res.json();
        
        const myRecipes = document.getElementById('my-recipes');
        myRecipes.innerHTML = '';

        recipeList.forEach(recipe => {
            const showRecipe = document.createElement('div');
            showRecipe.classList.add('recipeList');
            showRecipe.innerHTML = `
                <h3>${recipe.name}</h3>
                <p>${recipe.description}</p>
                <h3>Steps</h3>
                <p>${recipe.steps}</p>
                <h3>Ingredients</h3>
                <p>${recipe.ingredients}</p>
            `;
            myRecipes.appendChild(showRecipe);
        });
    } catch (error) {
        alert(`Error occurred: ${error}`);
    }
}

loadRecipe();