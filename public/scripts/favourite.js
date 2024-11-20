// Select all cuisines and like buttons dynamically
const cuisines = document.querySelectorAll('[id^="cuisine"]');
const favImages = document.querySelectorAll('[id^="like-"]');

async function currentLikeState() {
    for (let i = 0; i < cuisines.length; i++) {
        const cuisineName = cuisines[i].textContent.trim();
        const recipeId = await recipeInfo(cuisineName);
        const isLiked = await getLikes(recipeId);

        if (isLiked) {
            favImages[i].src = "images/heart.png";
        } else {
            favImages[i].src = "images/like.png";
        }
    }
}

async function recipeInfo(name) {
    try {
        const res = await fetch(`/recipes/cuisine/${name}`);
        const data = await res.json();
        if (res.status === 404) {
            return false;
        } else if (res.status === 200) {
            return data.id;
        }
    } catch (error) {
        alert(`Error occurred: ${error}`);
        return false;
    }
}

async function getLikes(id) {
    try {
        const res = await fetch(`/recipes/liked/${id}`);
        const data = await res.json();
        return data.liked;
    } catch (error) {
        alert(`Error occurred: ${error}`);
        return false;
    }
}

async function likeRecipe(id, image) {
    try {
        const res = await fetch(`/recipes/favourite/${id}`, {
            method: 'POST'
        });

        if (res.status === 201) {
            image.src = "images/heart.png";
            return true;
        }
        return false;
    } catch (error) {
        alert(`Error occurred: ${error}`);
        return false;
    }
}

async function unLike(id, image) {
    try {
        const res = await fetch(`/recipes/favourite/${id}`, {
            method: 'DELETE'
        });
        
        if (res.status === 200) {
            image.src = "images/like.png";
            return true;
        }
        return false;
    } catch (error) {
        alert(`Error occurred: ${error}`);
        return false;
    }
}

favImages.forEach((image, index) => {
    image.addEventListener('click', async () => {
        const cuisineName = cuisines[index].textContent.trim();
        const recipeId = await recipeInfo(cuisineName);
        const isLiked = await getLikes(recipeId);

        if (isLiked) {
            const result = await unLike(recipeId, image);
            if (!result) {
                alert('Could not unlike recipe');
            }
        } else {
            const result = await likeRecipe(recipeId, image);
            if (!result) {
                alert('Could not like recipe');
            }
        }
    });
});

// Initializes the recipes like state
currentLikeState();