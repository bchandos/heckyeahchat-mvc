const { Server } = require('ws');
const { authenticateWebsocket } = require('./jwt');
const sequelize = require('./models');

const Message = sequelize.models.Message;

const wss = new Server({ noServer: true });

wss.on('connection', (ws) => {
    console.log('Client connected');
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
            if (msgJson.type === 'new-message') {
                const message = await Message.create({
                    text: msgJson.contents.text,
                    sentAt: msgJson.contents.sentAt,
                    size: msgJson.contents.size,
                });
                message.setUser(msgJson.contents.UserId);
                message.setConversation(msgJson.contents.ConversationId);
                await message.save();
                response = await Message.findByPk(message.id, { include: 'User'} );
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
        console.log('Client disconnected');
    });
});



module.exports = wss;