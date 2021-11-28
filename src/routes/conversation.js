const express = require('express');
const router = express.Router();
const sequelize = require('../models');
const { authenticateToken } = require('../jwt');

const Conversation = sequelize.models.Conversation;
const User = sequelize.models.User;
const Reaction = sequelize.models.Reaction;
const ReactionType = sequelize.models.ReactionType;
// const QuotedMessage = sequelize.models.QuotedMessage;

// CRUD 

router.get('/:id', authenticateToken, async (req, res) => {
    // Read a conversation
    const userId = req.jwtPayload.user.id;
    const user = await User.findByPk(userId);
    const conversations = await user.getConversations();
    const conversation = await Conversation.findByPk(req.params.id);
    const reactionTypes = await ReactionType.findAll({ limit: 5});
    const messages = await conversation.getMessages({ 
        limit: 20, 
        order: [
            ['sentAt', 'DESC'],
            [Reaction,'reactedAt', 'ASC'],
        ], 
        include: [
            { 
                model: Reaction, 
                include: [ 
                    ReactionType, 
                    { 
                        model: User, 
                        attributes: ['nickname'] 
                    } 
                ]
            },
            // 'quotedMessage'
            {
                association: 'quotedMessage',
                include: [
                    {
                        model: User,
                        attributes: ['nickname']
                    }
                ]
            }
        ]
    });
    // messages.forEach(m => console.log(m.quotedMessage, m.quotedMessage[0]))
    return res.render('chat-pane.html', { 
        conversation, 
        user, 
        conversations, 
        messages: messages.reverse(),
        reactionTypes
    });
})

router.post('/', authenticateToken, async (req, res) => {
    // Create a conversation, and add users
    const body = req.body;
    const users = await Promise.all(
        body.userIds.map(async userId => (
            await User.findByPk(userId)
        ))
    );
    const conversationName = users.map(user => user.nickname).join(', ');
    const conversation = await Conversation.create({
        name: conversationName,
    })
    conversation.addUsers(users);
    return res.redirect(`/conversation/${conversation.id}`);
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
        return res.json(await conversation.getMessages({
            limit: parseInt(req.query.total),
            order: [
                ['sentAt', 'DESC']
            ], 
            include: [
                User,
                {
                    model: Reaction,
                    include: [ ReactionType ]
                },
            ]
        }));
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