require('dotenv').config()
const cors = require('cors');
const express = require('express');
const wss = require('./wss');

const sequelize = require('./models');

const routes = require('./routes');
const router = require('./routes/user');

const app = express();

app.use(cors());
app.use(express.json());

// Assign routes here
app.use('/user', routes.user);
app.use('/auth', routes.auth);

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