const express = require('express');
const router = express.Router();
const sequelize = require('../models');
const { authenticateToken } = require('../jwt');
const User = require('../models/user');

const Conversation = sequelize.models.Conversation;

// CRUD 

router.get('/:id', authenticateToken, async (req, res) => {
    // Read a conversation
    const conversations = await Conversation.findByPk(req.params.id);
    return res.json(conversations);
})

router.post('/', authenticateToken, async (req, res) => {
    // Create a conversation, and add users
    const body = req.body;
    const conversation = await Conversation.create({
        name: body.name,
    })
    conversation.addUsers(req.body.users);
    return res.json(conversation);
})

router.put('/:id?', authenticateToken, async (req, res) => {
    // Update a conversation
    const conversationId = req.params.id || req.body.id;
    const conversation = await Conversation.findByPk(conversationId);
    conversation.name = req.body.name;
    await conversation.save();
    return res.json(conversation);
})

router.delete('/:id?', authenticateToken, async (req, res) => {
    const conversationId = req.params.id || req.body.id;
    const conversation = await Conversation.findByPk(conversationId);
    await conversation.destroy();
    return res.json(`Conversation with id ${req.body.id} destroyed`);
})

// Other routes

router.get('/:id/messages', authenticateToken, async (req, res) => {
    // Get all a specific conversation's messages
    const conversation = await Conversation.findByPk(req.params.id);
    if (conversation) {
        return res.json(await conversation.getMessages( {order: ['sentAt'], include: 'User'} ));
    } else {
        return res.json([]);
    }
})

router.get('/:id/users', authenticateToken, async (req, res) => {
    // Get all a specific conversation's users
    const conversation = await Conversation.findByPk(req.params.id);
    if (conversation) {
        return res.json(await conversation.getUsers());
    } else {
        return res.json([]);
    }
})

module.exports = router;