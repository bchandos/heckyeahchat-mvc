const { Server } = require('ws');
const { authenticateWebsocket } = require('./jwt');
const nj = require('nunjucks');
const sequelize = require('./models');

const Message = sequelize.models.Message;
const User = sequelize.models.User;
const Reaction = sequelize.models.Reaction;
const ReactionType = sequelize.models.ReactionType;

const wss = new Server({ noServer: true });

wss.on('connection', (ws) => {
    console.log('Websocket client connected');
    // ws.send(JSON.stringify({'msg': 'You have connected to the websocket'}));
    ws.on('message', async (msg) => {
        const reactionTypes = await ReactionType.findAll({ limit: 5});
        const msgJson = JSON.parse(msg);
        let authenticated;
        if (msgJson.token) {
            authenticated = authenticateWebsocket(msgJson.token);
        } else {
            authenticated = false;
        }
        if (!authenticated) {
            ws.close(1000, 'Not authorized');
        }
        else {
            let response;
            switch (msgJson.type) {
                case 'new-message':
                    const message = await Message.create({
                        text: msgJson.contents.text,
                        sentAt: msgJson.contents.sentAt,
                        size: msgJson.contents.size,
                    });
                    message.setUser(msgJson.contents.userId);
                    message.setConversation(msgJson.contents.conversationId);
                    await message.save();
                    const newMessage = await Message.findByPk(message.id, {
                        order: [
                            [Reaction, 'reactedAt', 'ASC'],
                        ],
                        include: [
                            {
                                model: Reaction,
                                include: [ReactionType, { model: User, attributes: ['nickname'] }],
                            },
                        ],
                    });
                    // Include in the response the message so the User ID can be compared
                    // to the current user on the client side, which determines whether to
                    // append "self" version of message, or "other" version
                    response = {
                        type: 'message',
                        contents: {
                            newMessage,
                            self: nj.render('message-bubble.html', { msg: newMessage, user: newMessage.User, reactionTypes }),
                            other: nj.render('message-bubble.html', { msg: newMessage, reactionTypes }),
                        },
                    };
                    break;
                case 'new-reaction':
                    const reaction = await Reaction.create({
                        reactedAt: msgJson.contents.reactedAt,
                    });
                    reaction.setUser(msgJson.contents.userId);
                    reaction.setReactionType(msgJson.contents.reactionId);
                    reaction.setMessage(msgJson.contents.messageId);
                    await reaction.save();
                    // const reactionType = await reaction.getReactionType();
                    const reactedMessage = await reaction.getMessage({ 
                        order: [
                            [Reaction, 'reactedAt', 'ASC'],
                        ],
                        include: [ 
                            { 
                                model: Reaction, 
                                include: [ReactionType, { model: User, attributes: ['nickname'] }], 
                            } 
                        ]
                    });
                    // console.log(reactedMessage.Reactions);
                    response = {
                        type: 'reaction',
                        contents: {
                            messageId: reactedMessage.id,
                            newPane: nj.render('reaction-pane.html', { msg: reactedMessage })
                        },
                    };
                    break;
                case 'delete-message':
                    const delMessage = await Message.findByPk(msgJson.contents.messageId);
                    await delMessage.destroy();
                    response = {
                        type: 'delete-message',
                        contents: { messageId: delMessage.id }
                    }
                    break;
                }

            for (let client of wss.clients) {
                if (client.readyState === 1) {
                    client.send(JSON.stringify(response));
                }
            }
            // ws.send(JSON.stringify(response));
        }
    });
    ws.on('close', () => {
        console.log('Websocket client disconnected');
    });
});



module.exports = wss;