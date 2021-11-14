// chat-pane.js contains code specific to the chat pane template

import { MessagePane, MessageBubble } from './web-components.js';

const ws = new WebSocket('ws://localhost:5000');

const currentUserResp = await fetch('/user/current');
const currentUser = await currentUserResp.json();

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
    }
    form.querySelector('textarea').rows = 1;
}

let messageLastScrollHeight;

const submitOnEnter = (e) => {
    if (e.key === 'Enter' && !keysPressed.Shift) {
        e.preventDefault();
        document.getElementById('send-message-btn').click();
    }
    // This is not an ideal solution because it can't respond to 
    // pasted text, but we'll need to address later
    const textarea = e.target;
    const limitRows = 6;
    let rows = textarea.rows;
    // If we don't decrease the amount of rows, the scrollHeight would 
    // show the scrollHeight for all the rows even if there is no text.
    textarea.rows = 1;

    if (rows < limitRows && textarea.scrollHeight > messageLastScrollHeight) {
        rows++;
    } else if (rows > 1 && textarea.scrollHeight < messageLastScrollHeight) {
        rows--;
    }

    messageLastScrollHeight = textarea.scrollHeight;
    textarea.setAttribute("rows", rows);
}

// Attach event handlers

// Track multiple key presses so that Shift+Enter will work in textarea
let keysPressed = {};

document.addEventListener('keydown', (event) => {
    keysPressed[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    delete keysPressed[event.key];
});

document.getElementById('post-message').addEventListener('submit', postMessage);
ws.addEventListener('message', (e) => {
    console.log('Message received!');
    console.log(e);
    document.getElementById('message-pane').addMessage(e, currentUser.id)
})

document.getElementById('new-message').addEventListener('keydown', submitOnEnter);

// Web Components
customElements.define('message-pane', MessagePane);
customElements.define('message-bubble', MessageBubble);

// Scroll
document.querySelector('message-bubble.last-of-my-kind').scrollIntoView({ behavior: 'smooth' });