const profileImage = document.getElementById('pro-pic');
const profileImage2 = document.getElementById('pro-pic2');

async function checkLogin() {
    try {
        const res = await fetch('/users/login');
        const data = await res.json();

        if (res.status == 403) {
            window.location.assign('index.html');
        } else if (data.user && data.user.id) {
            profileImage.src = `${data.user.profile_pic}?t=${new Date().getTime()}`;
            profileImage2.src = `${data.user.profile_pic}?t=${new Date().getTime()}`;
            
            const username = data.user.username
            document.getElementById('signed-user').textContent = username;
        }
    } catch (error) {
        alert(`Error occured: ${error}`);
    }
}

async function userLogout() {
    try {
        const res = await fetch('/users/logout', {
            method: 'POST'
        });
        
        if (res.status == 200) {
            window.location.assign('index.html');
        }
    } catch (error) {
        alert(`Error occured: ${error}`);
    }
}

document.getElementById('pro-pic').addEventListener('click', () => {
    const subMenu = document.getElementById('subMenu');
    subMenu.classList.toggle('open-menu');
});

document.getElementById('logout').addEventListener('click', () => {
    userLogout();
});

checkLogin();