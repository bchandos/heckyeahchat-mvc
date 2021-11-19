export class MessagePane extends HTMLElement {
    constructor() {
        // Always call super first in constructor
        super();
        this.attachShadow({ mode: 'open' });
        const template = document.getElementById('message-pane-template').content;
        const wrapper = template.cloneNode(true);
        this.shadowRoot.append(wrapper);
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
        newMsg.dataset.msgId = data.contents.id;
        newMsg.setAttribute('slot', 'existing-msgs');
        const textSpan = document.createElement('span');
        const timeSpan = document.createElement('span');
        textSpan.setAttribute('slot', 'message-text');
        timeSpan.setAttribute('slot', 'message-time');
        textSpan.innerHTML = data.contents.text.replace('\n', '<br>');
        timeSpan.textContent = data.contents.sentAtPrettyTime;
        newMsg.append(textSpan, timeSpan);
        this.append(newMsg);
        newMsg.scrollIntoView({ behavior: 'smooth'});
    }

    removeMessage(data) {
        // If the message was added to the page during templating it will be available via
        // document, but not the shadowRoot. The opposite is true if the message was added
        // using addMessage. This might be a problem, but here's a quick solutions...
        const deletedElem = (
            document.querySelector(`message-bubble[data-msg-id="${data.contents.messageId}"]`) ||
            this.shadowRoot.querySelector(`message-bubble[data-msg-id="${data.contents.messageId}"]`)
        );
        deletedElem.style.transition = 'opacity 200ms ease-out';
        deletedElem.style.opacity = 0;
        deletedElem.addEventListener('transitionend', (e) => {
            e.target.remove();
        })
    }
}


export class MessageBubble extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        // const wrapper = document.createElement('div');
        const template = document.getElementById('message-bubbble-template').content;
        const wrapper = template.cloneNode(true);
        this.shadowRoot.append(wrapper);
    }

    connectedCallback() {
        const whom = this.dataset.whom;
        const container = this.shadowRoot.querySelector('div');
        const bubble = container.querySelector('span');
        let clickTimeout = null;

        if (whom === 'self') {
            bubble.classList.add('bg-light-blue');
            container.classList.add('justify-end')
        } else if (whom === 'other') {
            bubble.classList.add('bg-light-green');
            container.classList.add('justify-start')
        }
        // Fire custom event on deletion button click
        this.shadowRoot.querySelector('button.msg-del-btn').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent(
                'deleteMessage', 
                { 
                    detail: { 
                        messageId: this.dataset.msgId 
                    },
                    bubbles: true
                }
            ));
        })
        // Fire custom event on message context button
        this.shadowRoot.querySelector('button.message-btn').addEventListener('click', () => {
            // console.log(this);
            this.dispatchEvent(new CustomEvent(
                'messageMenu', 
                { 
                    detail: { 
                        messageId: this.dataset.msgId 
                    },
                    bubbles: true
                }
            ));
        });
        // Fire custom event when underlay div is clicked - appears only when menu is open
        this.shadowRoot.querySelector('.message-menu-underlay').addEventListener('click', () => {
            // console.log(this);
            this.dispatchEvent(new CustomEvent(
                'messageMenu', 
                { 
                    detail: { 
                        messageId: this.dataset.msgId 
                    },
                    bubbles: true
                }
            ));
        });
        // For press and hold, set a timeout that will dispatch the custom menu event
        // after 500ms
        bubble.addEventListener('mousedown', (e) => {
            if (!e.target.classList.contains('message-icon')) {
                clickTimeout = setTimeout( () => {
                    this.dispatchEvent(new CustomEvent(
                        'messageMenu', 
                        { 
                            detail: { 
                                messageId: this.dataset.msgId 
                            },
                            bubbles: true
                        }
                    ));
                }, 500);
            }
        });
        // When mouse button is released, clear the timeout for opening the menu
        bubble.addEventListener('mouseup', (e) => {
            clearTimeout(clickTimeout);
        });

        // Reaction click
        const reactionBtns = this.shadowRoot.querySelector('slot[name="reaction-types"]').assignedElements();
        
        for (let reactionBtn of Array.from(reactionBtns)) {
            reactionBtn.addEventListener('click', (e) => {
                const btn = e.currentTarget;
                this.dispatchEvent(new CustomEvent(
                    'reaction',
                    {
                        detail: {
                            reactionId: btn.dataset.reactionId,
                            messageId: this.dataset.msgId,
                        },
                        bubbles: true
                    }
                ))
            })
        }
    }
}