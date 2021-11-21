// chat-pane.js contains code specific to the chat pane template

// import { MessagePane, MessageBubble } from './web-components.js';

import { getCookie, delegator, replacer } from './utils.js';

const ws = new WebSocket('ws://localhost:5000');

const currentUserResp = await fetch('/user/current');
const currentUser = await currentUserResp.json();

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

const delMessage = async (e) => {
    // console.log(e);
    const messageId = e.target.closest('div.message-row').dataset.messageId;
    ws.send(JSON.stringify({
        token: getCookie('jwt'),
        type: 'delete-message',
        contents: { messageId }
    }));
}

const toggleMessageMenu = (e) => {
    let bubble;
    if (e.currentTarget.matches('#message-menu-underlay')) {
        const openMenu = document.querySelector('button.message-menu-btn[data-state="open"]');
        bubble = openMenu.closest('div.message-row');
    } else {
        bubble = e.target.closest('div.message-row');
    }
    const menuBtn = bubble.querySelector('.message-menu-btn');
    const menuElem = bubble.querySelector('.message-menu');
    const underlay = document.getElementById('message-menu-underlay');
    // console.log(bubble, menuBtn, menuElem);
    if (menuBtn.dataset.state === 'closed') {
        menuBtn.classList.remove('child');
        menuElem.classList.remove('dn');
        underlay.classList.remove('dn');
        menuBtn.dataset.state = 'open';
    } else {
        menuBtn.classList.add('child');
        menuElem.classList.add('dn');
        underlay.classList.add('dn');
        menuBtn.dataset.state = 'closed';
    }
}

const reactToMessage = (e) => {
    // console.log(e.target);
    const messageId = e.target.closest('div.message-row').dataset.messageId;
    const reactionId = e.target.dataset.reactionId;
    ws.send(JSON.stringify({
        token: getCookie('jwt'),
        type: 'new-reaction',
        contents: { 
            messageId, 
            reactionId, 
            userId: currentUser.id,
            reactedAt: new Date()
        }
    }));
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
    // console.log('Message received!');
    const data = JSON.parse(e.data);
    if (data.type === 'message') {
        if (data.contents.newMessage.UserId === currentUser.id) {
            document.getElementById('message-view').insertAdjacentHTML('beforeend', data.contents.self);
        } else {
            document.getElementById('message-view').insertAdjacentHTML('beforeend', data.contents.other);
        }
        document.getElementById('bottom-marker').scrollIntoView({ behavior: 'smooth'});
    } else if (data.type === 'delete-message') {
        const deletedElem = document.querySelector(`div.message-row[data-message-id="${data.contents.messageId}"]`);
        deletedElem.style.transition = 'opacity 200ms ease-out';
        deletedElem.style.opacity = 0;
        deletedElem.addEventListener('transitionend', (e) => {
            e.target.remove();
            document.getElementById('message-menu-underlay').classList.add('dn');
        });
    } else if (data.type === 'reaction') {
        const reactedElem = document.querySelector(`div.message-row[data-message-id="${data.contents.messageId}"]`);
        const reactionPane = reactedElem.querySelector('.reaction-pane');
        replacer(reactionPane, data.contents.newPane);
    }
})

document.getElementById('new-message').addEventListener('keydown', submitOnEnter);

delegator('#chat-pane', '.message-icon', 'click', toggleMessageMenu);
delegator('#chat-pane', '.msg-del-btn', 'click', delMessage);
delegator('#chat-pane', '.msg-react-btn', 'click', reactToMessage);

document.getElementById('message-menu-underlay').addEventListener('click', toggleMessageMenu);

// Delegated event handler for buttons, so newly added messages work
// document.getElementById('chat-pane').addEventListener('deleteMessage', delMessage);
// document.getElementById('chat-pane').addEventListener('messageMenu', toggleMessageMenu);
// document.getElementById('chat-pane').addEventListener('reaction', reactToMessage);

// Web Components
// customElements.define('message-pane', MessagePane);
// customElements.define('message-bubble', MessageBubble);

// Scroll
document.querySelector('.last-of-my-kind').scrollIntoView({ behavior: 'smooth' });
