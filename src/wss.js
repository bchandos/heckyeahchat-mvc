const { Server } = require('ws');
const { authenticateWebsocket } = require('./jwt');


const wss = new Server({ noServer: true });

wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.send(JSON.stringify({'msg': 'You have connected to the websocket'}));
    ws.on('message', (msg) => {
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
            ws.send(JSON.stringify({'msg': 'You have been authorized!'}));
        }
    });
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});



module.exports = wss;