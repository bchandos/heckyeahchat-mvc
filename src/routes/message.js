const express = require('express');
const router = express.Router();
const sequelize = require('../models');
const { authenticateToken } = require('../jwt');

const Message = sequelize.models.Message;

// CRUD 

router.get('/:id', authenticateToken, async (req, res) => {
    // Read a message
    const messages = await Message.findByPk(req.params.id);
    return res.json(messages);
})

router.post('/', authenticateToken, async (req, res) => {
    // Create a message
    const body = req.body;
    const message = await Message.create({
        text: body.text,
        sentAt: body.sentAt,
        size: body.size,
    })
    message.setUser(body.userId);
    message.setConversation(body.conversationId);
    return res.json(message);
})

router.put('/:id?', authenticateToken, async (req, res) => {
    // Update a message
    const messageId = req.params.id || req.body.id;
    const message = await Message.findByPk(messageId);
    message.text = req.body.text;
    message.sentAt = req.body.sentAt;
    await message.save();
    return res.json(message);
})

router.delete('/:id?', authenticateToken, async (req, res) => {
    const messageId = req.params.id || req.body.id;
    const message = await Message.findByPk(messageId);
    await message.destroy();
    return res.json(`Message with id ${req.body.id} destroyed`);
})

// Other routes

// router.get('/:id/things', authenticateToken, async (req, res) => {
//     // Get all a specific message's lanes
//     const message = await Message.findByPk(req.params.id);
//     if (message) {
//         return res.json(await message.getThings());
//     } else {
//         return res.json([]);
//     }
// })


module.exports = router;