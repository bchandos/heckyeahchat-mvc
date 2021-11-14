// Event handlers
const toggleUserMenu = (e) => {
    // Do not assume button is event target, as the underlay can fire this event
    const btn = document.getElementById('account-btn');
    const menuElems = document.querySelectorAll('div.menu-show');
    if (btn.dataset.state === 'closed') {
        for (let elem of menuElems) {
            elem.style.display = 'block';
        }
        btn.dataset.state = 'open';
    } else {
        for (let elem of menuElems) {
            elem.style.display = 'none';
        }
        btn.dataset.state = 'closed';
    }
}

// Attach event handlers
document.getElementById('account-btn').addEventListener('click', toggleUserMenu);
document.getElementById('menu-underlay').addEventListener('click', toggleUserMenu);
