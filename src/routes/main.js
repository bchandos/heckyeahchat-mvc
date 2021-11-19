const express = require('express');
const router = express.Router();
const sequelize = require('../models');
const { authenticateToken } = require('../jwt');

const User = sequelize.models.User;
const ReactionType = sequelize.models.ReactionType;

router.get('/', authenticateToken, async (req, res) => {
    const userId = req.jwtPayload.user.id;
    const user = await User.findByPk(userId);
    if (user) {
        const conversations = await user.getConversations();
        return res.render('index.html', { user, conversations });
    }
    else {
        return res.redirect('/login');
    }
})

router.get('/login', async (req, res) => {
    // Do nothing of importance
    return res.render('login.html', {});
})

router.get('/sign-up', async (req, res) => {
    return res.render('signup.html', {});
})

router.get('/logout', async (req, res) => {
    res.clearCookie('jwt');
    return res.redirect('/login');
})

// Move somewhere else
router.get('/reactions', authenticateToken, async (req, res) => {
    return res.render('reactions.html');
})

router.get('/new-conversation', authenticateToken, async (req, res) => {
    const users = await User.findAll();
    return res.render('new-conversation.html', { users });
})

router.post('/reaction', authenticateToken, async (req, res) => {
    // Create a new reaction type
    // console.log(req.body);
    const rType = await ReactionType.create({
        name: req.body.name,
        description: req.body.description,
        image: req.body['image-url'],
        unicode: req.body.unicode,
    })
    return res.redirect('/reactions');
})

module.exports = router;