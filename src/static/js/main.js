// Event handlers
const toggleUserMenu = (e) => {
    const btn = e.currentTarget;
    if (btn.dataset.state === 'closed') {
        btn.nextElementSibling.style.display = 'block';
        btn.dataset.state = 'open';
    } else {
        btn.nextElementSibling.style.display = 'none';
        btn.dataset.state = 'closed';
    }
}

// Attach event handlers
document.getElementById('account-btn').addEventListener('click', toggleUserMenu);