async function checkLogin() {
    try {
        const res = await fetch('/users/login');
        const data = await res.json();

        if (res.status == 403) {
            window.location.assign('index.html');
        } else if (data.user && data.user.id) {
            previewImage.src = `${data.user.profile_pic}?t=${new Date().getTime()}`;
        }
    } catch (error) {
        alert(`Error occured: ${error}`);
    }
}

async function updateUser(details) {
    try {
        const res = await fetch('/users/userUpdate', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(details)
        });

        if (res.status == 401) {
            alert('Invalid details provided');
        } else if (res.status == 201) {
            alert('User updated successfully');
        }
    } catch (error) {
        alert(`Error occured: ${error}`);
    }
}

async function passwordUpdate(details) {
    try {
        const res = await fetch('/users/passwordUpdate', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(details)
        });

        if (res.status == 400) {
            alert('Invalid Current Password');
        } else if (res.status == 401) {
            alert('Invalid details provided');
        } else if (res.status == 201) {
            alert('Password updated successfully');
        }
    } catch (error) {
        alert(`Error occured: ${error}`);
    }
}

function setErrorFor(input, message) {
    const formBox = input.parentElement;
    const small = formBox.querySelector("small");

    small.innerText = message;

    formBox.className = "form-group error";
}

function setSuccessFor(input) {
    const formBox = input.parentElement;
    formBox.className = "form-group success";
}

function isEmail(email) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
}

document.getElementById('update-name').addEventListener('click', () => {
    const usernameInput = document.getElementById('newUsername');
    const emailInput = document.getElementById('newEmail');

    const details = {
        username: usernameInput.value,
        email: emailInput.value
    };

    let valid = true;

    if (details.email === "") {
        setErrorFor(emailInput, "Email address is required!");
        valid = false;
    } else if (!isEmail(details.email)) {
        setErrorFor(emailInput, 'Not a valid email!');
        valid = false;
    } else {
        setSuccessFor(emailInput);
    }

    if (details.username === "") {
        setErrorFor(usernameInput, "Username is required!");
        valid = false;
    } else {
        setSuccessFor(usernameInput);
    }

    if (valid) {
        updateUser(details);
        usernameInput.valid = '';
        emailInput.valid = '';
    }
});

document.getElementById('pass-update').addEventListener('click', () => {
    const currentPasswordInput = document.getElementById('curr-pass');
    const newPasswordInput = document.getElementById('new-pass');
    const confirmPasswordInput = document.getElementById('confirm-pass');

    const details = {
        currentPassword: currentPasswordInput.value,
        newPassword: newPasswordInput.value,
        confirmPassword: confirmPasswordInput.value
    };

    let valid = true;

    if (details.currentPassword === "") {
        setErrorFor(currentPasswordInput, "Current password is required!");
        valid = false;
    } else {
        setSuccessFor(currentPasswordInput);
    }

    if (details.newPassword === "") {
        setErrorFor(newPasswordInput, "New password is required!");
        valid = false;
    } else {
        setSuccessFor(newPasswordInput);
    }

    if (details.confirmPassword === "") {
        setErrorFor(confirmPasswordInput, "Confirm password is required!");
        valid = false;
    } else {
        setSuccessFor(confirmPasswordInput);
    }

    if (details.newPassword !== details.confirmPassword) {
        setErrorFor(confirmPasswordInput, "Passwords do not match!");
        valid = false;
    }

    if (valid) {
        passwordUpdate(details);
        currentPasswordInput.value = '';
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
    }
});

const imageInput = document.getElementById('imageInput');
const previewImage = document.getElementById('avatar');

document.getElementById('uploadButton').addEventListener('click', async () => {
    const file = imageInput.files[0];
    if (!file) {
        alert('Please select a file');
        return;
    }
    if (file.size > 1024 * 1024 * 1) {
        alert('File size should be less than 1MB');
        return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const res = await fetch('/users/upload', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();

        if (res.status == 400) {
            alert(data.message || 'No file uploaded or file type not supported');
        } else if (res.status == 403) {
            alert('Unauthorized to upload image');
        } else if (res.status == 200) {
            previewImage.src = `${data.imageUrl}?t=${new Date().getTime()}`;
            alert('Image uploaded successfully');
        }
    } catch (error) {
        alert(`Error occured: ${error}`);
    }
});

checkLogin();