const recipeId = document.querySelector('meta[name="recipe-number"]').content;

async function checkLogin() {
    try {
        const res = await fetch('/users/login');
        const data = await res.json();

        if (data.user) {
            const username = data.user.username
            return username
        }
    } catch (error) {
        alert(`Error occured: ${error}`);
    }
}

document.getElementById('submit-comment').addEventListener('click', async () => {
    const commentInput = document.getElementById('comment');
    const comment = commentInput.value.trim();
    const currUser = await checkLogin();

    if (comment) {
        try {
            const res = await fetch(`/recipes/comments/${recipeId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: comment }),
            });

            if (res.status == 201) {
                const data = await res.json();
                const commentsContainer = document.getElementById('comments-container');
                const newComment = document.createElement('div');
                newComment.classList.add('comment');
                newComment.innerHTML = `<strong>${currUser}: </strong> ${comment}`;
                
                commentsContainer.prepend(newComment);
                commentInput.value = '';

            } else if (res.status == 403) {
                alert('You need to login to comment');
            } else if (res.status == 401) {
                alert('Comment content error');
            } else {
                alert('Error posting comment');
            }
        } catch (error) {
            alert(`Error occured: ${error}`);
        }
    } else {
        alert('Comment cannot be empty!');
    }
});

async function loadComments(recipeId) {
    try {
        const response = await fetch(`/recipes/comments/${recipeId}`);
        const comments = await response.json();

        const commentsContainer = document.getElementById('comments-container');
        commentsContainer.innerHTML = ''; // Clear existing comments

        comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.classList.add('comment');
            commentDiv.innerHTML = `<strong>${comment.username}: </strong> ${comment.content}`;
            commentsContainer.appendChild(commentDiv);
        });
    } catch (error) {
        alert(`Error occured: ${error}`);
    }
}

loadComments(recipeId);