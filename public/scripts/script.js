const recipeId = document.querySelector('meta[name="recipe-number"]').content;

async function checkLogin() {
    try {
        const res = await fetch('/users/login');
        const data = await res.json();

        if (data.user) {
            return data
        } else if (res.status == 403) {
            alert('Please login and try again');
        }
    } catch (error) {
        alert(`Error occured: ${error}`);
    }
}

async function deleteComment(commentId) {
    try {
        const res = await fetch(`/recipes/comments/${commentId}`, {
            method: 'DELETE',
        });

        if (res.status == 200) {
            alert('Comment deleted successfully');
        } else if (res.status == 404) {
            alert('Comment not found');
        } else if (res.status == 401) {
            alert('Unauthorized! Failed to delete comment');
        }
    } catch (error) {
        alert(`Error occurred while deleting comment: ${error}`);
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
                newComment.innerHTML = `<strong>${currUser.user.username}: </strong> ${comment}`;
                
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
        const currUser = await checkLogin();
        const response = await fetch(`/recipes/comments/${recipeId}`);
        const comments = await response.json();

        const commentsContainer = document.getElementById('comments-container');
        commentsContainer.innerHTML = ''; // Clear existing comments

        comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.classList.add('comment');
            commentDiv.innerHTML = `
                <strong>${comment.username}: </strong> ${comment.content}
                ${
                    currUser.user.id === comment.user_id?
                    `<button class="delete-comment-btn" data-comment-id="${comment.id}">Delete</button>` :
                    ''
                }
            `;
            commentsContainer.appendChild(commentDiv);
        });

        document.querySelectorAll('.delete-comment-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const commentId = e.target.getAttribute('data-comment-id');
                await deleteComment(commentId);
                loadComments(recipeId);
            });
        });
    } catch (error) {
        alert(`Error occured: ${error}`);
    }
}

loadComments(recipeId);