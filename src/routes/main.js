const express = require('express');
const router = express.Router();
const sequelize = require('../models');
const { authenticateToken } = require('../jwt');
const { route } = require('./user');

const User = sequelize.models.User;


router.get('/', authenticateToken, async (req, res) => {
    const userId = req.jwtPayload.user.id;
    const user = await User.findByPk(userId);
    if (user) {
        const conversations = await user.getConversations();
        return res.render('index.html', { conversations });
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

// router.get('/logout', async (req, res) => {

// })

module.exports = router;