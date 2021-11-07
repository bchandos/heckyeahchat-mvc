import { MessagePane } from './web-components.js';

const ws = new WebSocket('ws://localhost:5000');

const getCookie = (cName) => {
    const name = `${cName}=`;
    const cDecoded = decodeURIComponent(document.cookie); //to be careful
    const cArr = cDecoded.split('; ');
    let res;
    cArr.forEach(val => {
      if (val.indexOf(name) === 0) res = val.substring(name.length);
    })
    return res
}

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

const postMessage = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const messageContents = formData.get('text');
    formData.append('sentAt', new Date());
    
    if (messageContents.trim() !== '') {
        const message = Object.fromEntries(formData);
        ws.send(JSON.stringify({
            token: getCookie('jwt'),
            type: 'new-message',
            contents: message,
        }));
        form.reset();
        // const response = await fetch(form.action, {
        //     method: form.method,
        //     // body: formData,
        //     headers: {
        //         'content-type': 'application/json'
        //     },
        //     body: JSON.stringify(Object.fromEntries(formData))
        // });
        // const js = await response.json()
        // console.log(js);
    }
}

// Attach event handlers
document.getElementById('account-btn').addEventListener('click', toggleUserMenu);
document.getElementById('post-message').addEventListener('submit', postMessage);
ws.addEventListener('message', (e) => {
    console.log('Message received!');
    document.getElementById('message-pane').addMessage(e)
})

// Web Components
customElements.define('message-pane', MessagePane);