const { Server } = require('ws');
const { authenticateWebsocket } = require('./jwt');
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
                    console.log(msgJson.contents);
                    const message = await Message.create({
                        text: msgJson.contents.text,
                        sentAt: msgJson.contents.sentAt,
                        size: msgJson.contents.size,
                    });
                    message.setUser(msgJson.contents.userId);
                    message.setConversation(msgJson.contents.conversationId);
                    await message.save();
                    response = {
                        type: 'message',
                        contents: await Message.findByPk(message.id, {
                            include: [
                                User, 
                                {
                                    model: Reaction,
                                    include: [ReactionType],
                                },
                            ],
                        }),
                    };
                    break;
                case 'new-reaction':
                    const reaction = await Reaction.create({
                        reactedAt: msgJson.contents.reactedAt,
                    });
                    reaction.setUser(msgJson.contents.UserId);
                    reaction.setReactionType(msgJson.contents.reactionTypeId);
                    await reaction.save();
                    response = {
                        type: 'reaction',
                        contents: await Message.findByPk(reaction.id, { 
                            include: [
                                User, 
                                {
                                    model: Reaction,
                                    include: [ReactionType],
                                },
                            ],
                        }),
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