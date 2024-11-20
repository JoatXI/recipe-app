async function ajaxLogin(details) {
    try {
        const res = await fetch(`/users/login`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(details)
        });

        if (res.status == 401) {
            alert('Invalid login details');
        } else if (res.status == 200) {
            window.location.assign('dashboard.html');
        }
    } catch (error) {
        alert(`An error occurred while logging in ${error}`);
    }
}

function setErrorFor(input, message) {
    const formBox = input.parentElement;
    const small = formBox.querySelector("small");

    small.innerText = message;

    formBox.className = "inlineBox error";
}

function setSuccessFor(input) {
    const formBox = input.parentElement;
    formBox.className = "inlineBox success";
}

document.getElementById('ajaxLogin').addEventListener('click', () => {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    const details = {
        username: usernameInput.value,
        password: passwordInput.value
    };

    let valid = true;

    if(details.username === "") {
        setErrorFor(usernameInput, "Username is required!");
        valid = false;
    } else {
        setSuccessFor(usernameInput);
    }

    if(details.password === "") {
        setErrorFor(passwordInput, "Password is required!");
        valid = false;
    } else {
        setSuccessFor(passwordInput);
    }

    if(valid) {
        ajaxLogin(details);
    }
});