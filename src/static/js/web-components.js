export class MessagePane extends HTMLElement {
    constructor() {
        // Always call super first in constructor
        super();
        this.attachShadow({ mode: 'open' });
        const wrapper = document.createElement('div');
        const style = document.createElement('link');
        const slot = document.createElement('slot');
        slot.setAttribute('name', 'existing-msgs');
        style.setAttribute('rel', 'stylesheet');
        style.setAttribute('href', 'https://unpkg.com/tachyons@4.12.0/css/tachyons.min.css')
        wrapper.classList.add('pa1');
        wrapper.appendChild(slot);
        this.shadowRoot.append(style, wrapper);
    }

    async connectedCallback() {
        this.conversationId = this.dataset.conversationId;
    }

    addMessage(e, currentUserId) {
        const data = JSON.parse(e.data)
        // console.log(data);
        const newMsg = document.createElement('message-bubble');
        if (data.contents.UserId === currentUserId) {
            // console.log('Message from current user!!')
            newMsg.dataset.whom = 'self';
        } else {
            // console.log('Message from another user!')
            newMsg.dataset.whom = 'other';
        }
        newMsg.setAttribute('slot', 'existing-msgs');
        const textSpan = document.createElement('span');
        const timeSpan = document.createElement('span');
        textSpan.setAttribute('slot', 'message-text');
        timeSpan.setAttribute('slot', 'message-time');
        textSpan.textContent = data.contents.text;
        timeSpan.textContent = data.contents.sentAtPrettyTime;
        newMsg.append(textSpan, timeSpan);
        this.shadowRoot.append(newMsg);
        newMsg.scrollIntoView({ behavior: 'smooth'});
    }
}


export class MessageBubble extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const style = document.createElement('link');
        style.setAttribute('rel', 'stylesheet');
        style.setAttribute('href', 'https://unpkg.com/tachyons@4.12.0/css/tachyons.min.css')
        // const wrapper = document.createElement('div');
        const template = document.getElementById('message-bubbble-template').content;
        const wrapper = template.cloneNode(true);
        this.shadowRoot.append(style, wrapper);
    }

    connectedCallback() {
        const whom = this.dataset.whom;
        const container = this.shadowRoot.querySelector('div');
        const bubble = container.querySelector('span');

        // // container.classList.add('flex', 'flex-row');
        // // const bubble = document.createElement('span');
        // // bubble.classList.add('ph2', 'pv4', 'ma2', 'w-33', 'br4');
        if (whom === 'self') {
            bubble.classList.add('bg-light-blue');
            container.classList.add('justify-end')
        } else if (whom === 'other') {
            bubble.classList.add('bg-light-green');
            container.classList.add('justify-start')
        }
        // const contentSpan = document.createElement('span');
        // const timeSpan = document.createElement('span');
        // contentSpan.setAttribute('slot', 'message-text');
        // timeSpan.setAttribute('slot', 'message-time');
        // contentSpan.textContent = this.dataset.contents;
        // timeSpan.textContent = this.dataset.time;
        // bubble.append(contentSpan, timeSpan);
        // // this.dataset.contents = null;
    }
}