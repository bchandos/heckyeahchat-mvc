export class MessagePane extends HTMLElement {
    constructor() {
        // Always call super first in constructor
        super();
        this.attachShadow({ mode: 'open' });
        const wrapper = document.createElement('div');
        wrapper.classList.add('pa1');
        this.shadowRoot.append(wrapper);
    }

    async connectedCallback() {
        this.conversationId = this.dataset.conversationId;
    }

    addMessage(msg) {
        const data = JSON.parse(msg.data)
        const newMsg = document.createElement('div');
        // newMsg.classList.add('bg-red', 'pa2', 'ma2');
        newMsg.textContent = data.contents.text;
        this.shadowRoot.append(newMsg);
    }
}


export class YouMessage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const wrapper = document.createElement('div');
        this.shadowRoot.append(wrapper);
    }
}