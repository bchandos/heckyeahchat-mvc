require('dotenv').config()
const cors = require('cors');
const express = require('express');
const wss = require('./wss');

const sequelize = require('./models');

const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());

// Assign routes here
app.use('/user', routes.user);
app.use('/auth', routes.auth);
app.use('/conversation', routes.conversation);
app.use('/message', routes.message);

const server = app.listen(process.env.PORT, async () => {
    await sequelize.sync();
    console.log('All models were synchronized successfully.')
    console.log(`Template app listening on port ${process.env.PORT}`);
});

server.on('upgrade', (request, socket, head) => {
    console.log('Websockets upgrade requested');
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});