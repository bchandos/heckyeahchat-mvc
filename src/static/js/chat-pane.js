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
}

const submitOnEnter = (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('send-message-btn').click();
    }
}

// Attach event handlers
const postMsgForm = document.getElementById('post-message');
const newMsgInput = document.getElementById('new-message');

document.getElementById('post-message').addEventListener('submit', postMessage);
ws.addEventListener('message', (e) => {
    console.log('Message received!');
    document.getElementById('message-pane').addMessage(e, currentUser.id)
})

document.getElementById('new-message').addEventListener('keydown', submitOnEnter);

// Web Components
customElements.define('message-pane', MessagePane);
customElements.define('message-bubble', MessageBubble);

// Scroll
document.querySelector('message-bubble.last-of-my-kind').scrollIntoView({ behavior: 'smooth' });