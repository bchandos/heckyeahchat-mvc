const express = require('express');
const router = express.Router();
const sequelize = require('../models');
const { authenticateToken } = require('../jwt');

const User = sequelize.models.User;

// CRUD 

router.get('/:id', authenticateToken, async (req, res) => {
    // Read a user
    const users = await User.findByPk(req.params.id);
    return res.json(users);
})

router.post('/', authenticateToken, async (req, res) => {
    // Create a user
    const body = req.body;
    const user = await User.create({
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        nickname: body.nickname,
    })
    return res.json(user);
})

router.put('/:id?', authenticateToken, async (req, res) => {
    // Update a user
    const userId = req.params.id || req.body.id;
    const user = await User.findByPk(userId);
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.nickname = req.body.nickname;
    user.email = req.body.email;
    await user.save();
    return res.json(user);
})

router.delete('/:id?', authenticateToken, async (req, res) => {
    const userId = req.params.id || req.body.id;
    const user = await User.findByPk(userId);
    await user.destroy();
    return res.json(`User with id ${req.body.id} destroyed`);
})

// Other routes

router.get('/:id/conversations', authenticateToken, async (req, res) => {
    // Get all a specific user's conversations
    const user = await User.findByPk(req.params.id);
    if (user) {
        const conversations = await user.getConversations();
        // Do too much work to add the user counts to each conversation 
        const conversationsWithCounts = await Promise.all(conversations.map(async (conversation) => {
            const users = await conversation.getUsers();
            const userCount = users.length;
            conversation.setDataValue('userCount', userCount);
            return conversation;
        }))
        return res.json(conversationsWithCounts);
    } else {
        return res.json([]);
    }
})

module.exports = router;