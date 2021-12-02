// chat-pane.js contains code specific to the chat pane template

// import { MessagePane, MessageBubble } from './web-components.js';

import { getCookie, delegator, replacer } from './utils.js';

let ws = new WebSocket('ws://localhost:5000');

const currentUserResp = await fetch('/user/current');
const currentUser = await currentUserResp.json();

let typingTimeout = null;
let typingStatus = false;
let clickTimeout = null;

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
    clearReply();
}

let messageLastScrollHeight;

const submitOnEnter = (e) => {
    if (e.key === 'Enter' && !keysPressed.Shift) {
        e.preventDefault();
        document.getElementById('send-message-btn').click();
    }
    // TODO: This is not an ideal solution because it can't respond to 
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
    const messageId = e.target.closest('div.message-row').dataset.messageId;
    ws.send(JSON.stringify({
        token: getCookie('jwt'),
        type: 'delete-message',
        contents: { messageId }
    }));
}

const toggleMessageMenu = (e) => {
    let bubble;
    if (e && !e.target.matches('#message-menu-underlay')) {
        bubble = e.target.closest('div.message-row');
    } else {
        const openMenu = document.querySelector('button.message-menu-btn[data-state="open"]');
        bubble = openMenu.closest('div.message-row');
    }
    const menuBtn = bubble.querySelector('.message-menu-btn');
    const menuElem = bubble.querySelector('.message-menu');
    const underlay = document.getElementById('message-menu-underlay');
    if (menuBtn.dataset.state === 'closed') {
        // First, determine if the menu should open up or down...
        const openDirection = openUpOrDown(bubble);
        if (openDirection === 'up') {
            menuElem.style.top = '-125px';
        }
        menuBtn.classList.remove('child');
        menuElem.classList.remove('dn');
        underlay.classList.remove('dn');
        menuBtn.dataset.state = 'open';
    } else {
        menuBtn.classList.add('child');
        menuElem.classList.add('dn');
        menuElem.style.top = null;
        underlay.classList.add('dn');
        menuBtn.dataset.state = 'closed';
    }
}

const reactToMessage = (e) => {
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
    toggleMessageMenu();
}

const replyOpenTransition = (e) => {
    if (e.target.matches('#post-message-box')) {
        document.getElementById('reply-message').classList.add('flex');
        document.getElementById('reply-message').clientWidth;
        document.getElementById('reply-message').classList.remove('o-0');
    }
    // TODO: figure out why msgBox is in scope here ...
    msgBox.removeEventListener('transitionend', replyOpenTransition);
}

const replyToMessage = (e) => {
    const msgRow = e.target.closest('.message-row'); 
    const msgId = msgRow.dataset.messageId;
    const msgContents = msgRow.querySelector('.message-contents').innerText;
    const msgBox = document.getElementById('post-message-box');
    msgBox.dataset.oldHeight = msgBox.style.height;
    msgBox.addEventListener('transitionend', replyOpenTransition);
    msgBox.style.height = '116px';
    document.getElementById('reply-contents').innerHTML = msgContents;
    document.getElementsByName('replyMsgId')[0].value = msgId;
    toggleMessageMenu();
    document.getElementById('new-message').focus();
}

const replyCloseTransition = (e) => {
    if (e.target.matches('#reply-message')) {
        document.getElementById('reply-contents').innerHTML = "";
        msgBox.style.height = msgBox.dataset.oldHeight;
        msgBox.dataset.oldHeight = null;
        e.target.classList.remove('flex');
    }
    e.target.removeEventListener('transitionend', replyCloseTransition);
}

const clearReply = (e) => {
    const replyMsg = document.getElementById('reply-message');
    replyMsg.addEventListener('transitionend', replyCloseTransition);
    replyMsg.classList.add('o-0');
    document.getElementsByName('replyMsgId')[0].value = null;
}

const typingIndicator = (e) => {
    if (!typingStatus && !e.key.Enter) {
        ws.send(JSON.stringify({
            token: getCookie('jwt'),
            type: 'typing-indicator',
            contents: {
                userId: currentUser.id,
                typingStatus: 'on',
                userName: currentUser.nickname,
            }
        }));
        typingStatus = true;
    }
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        ws.send(JSON.stringify({
            token: getCookie('jwt'),
            type: 'typing-indicator',
            contents: {
                userId: currentUser.id,
                typingStatus: 'off',
                userName: currentUser.nickname,
            }
        }));
        typingStatus = false;
    }, 2000)
}

const setMenuTimeout = (e) => {
    if (!e.target.matches('.message-icon')) {
        clickTimeout = setTimeout( () => {
            toggleMessageMenu(e);
        }, 500);
    }
}

const clearMenuTimeout = (e) => {
    clearTimeout(clickTimeout);
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

document.getElementById('new-message').addEventListener('keydown', submitOnEnter);

delegator('#chat-pane', '.message-icon', 'click', toggleMessageMenu);
delegator('#chat-pane', '.msg-del-btn', 'click', delMessage);
delegator('#chat-pane', '.msg-react-btn', 'click', reactToMessage);
delegator('#chat-pane', '.msg-reply-btn', 'click', replyToMessage);
delegator('#chat-pane', '.message-bubble, .message-bubble *', 'mousedown', setMenuTimeout);
delegator('body', '*', 'mouseup', clearMenuTimeout);

document.getElementById('message-menu-underlay').addEventListener('click', toggleMessageMenu);

document.getElementById('new-message').addEventListener('keyup', typingIndicator);

document.getElementById('reply-remove').addEventListener('click', clearReply);

document.getElementById('typing-indicator').addEventListener('transitionend', (e) => {
    if (e.target.dataset.state === 'open') {
        e.target.innerText = '';
        e.target.dataset.state = 'closed';
    } else {
        e.target.dataset.state = 'open';
    }
})

// Websocket handling
ws.addEventListener('message', (e) => {
    // console.log('Message received!');
    const data = JSON.parse(e.data);
    if (data.type === 'message') {
        console.log(data.contents.newMessage.UserId === currentUser.id);
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
    } else if (data.type === 'typing-on') {
        if (data.contents.userId !== currentUser.id) {
            const indicator = document.getElementById('typing-indicator');
            indicator.innerHTML = `
                ${data.contents.userName} is typing
                <img src="/image/activity-dots.svg" alt="activity is happening" class="w2">
            `;
            indicator.classList.add('visible');
        }
    } else if (data.type === 'typing-off') {
        const indicator = document.getElementById('typing-indicator');
        indicator.classList.remove('visible');
    }
})

const wsChecker = setInterval(() => {
    console.log(ws.readyState);
    if (ws.readyState === 3) {
        console.log('Socket has been disconnected!');
        // let i = 0;
        // while (ws.readyState !== 1 && i < 3) {
        //     ws = new WebSocket('ws://localhost:5000');
        //     i++;
        // }
    }
}, 30000)

// Scroll
document.querySelector('.last-of-my-kind').scrollIntoView({ behavior: 'smooth' });

// Random
// TODO: This needs to handle window resizing events
const msgBox = document.getElementById('post-message-box');
msgBox.style.height = `${msgBox.clientHeight}px`;

const openUpOrDown = (bubbleElem) => {
    const view = document.getElementById('message-view')
    const viewBottom = view.getBoundingClientRect().bottom;
    const bubbleBottom = bubbleElem.getBoundingClientRect().bottom;
    // the value 100 should probably be calculated by height of the bubble element
    // as well as some reasonable estimate of the menu height, but it works pretty
    // well for a stand-in value
    return (viewBottom - 100) > bubbleBottom ? 'down' : 'up';
}