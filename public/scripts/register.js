async function regUser(details) {
    try {
        const res = await fetch(`/users/register`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(details)
        });

        if (res.status == 401) {
            alert('Invalid Details Provided');
        } else if (res.status == 200) {
            window.location.assign('login.html');
            alert('Registration successful. You can now log in');
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

function isEmail(email) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
}

document.getElementById('regUser').addEventListener('click', () => {
    const emailInput = document.getElementById('email');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    const details = {
        email: emailInput.value,
        username: usernameInput.value,
        password: passwordInput.value
    };

    let valid = true;

    if(details.email === "") {
        setErrorFor(emailInput, "Email address is required!");
        valid = false;
    } else if (!isEmail(details.email)) {
        setErrorFor(emailInput, 'Not a valid email!');
        valid = false;
    } else {
        setSuccessFor(emailInput);
    }

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

    if (valid) {
        regUser(details);
    }
});