const express = require('express');
const router = express.Router();
const sequelize = require('../models');
const { generateAccessToken, authenticateToken } = require('../jwt');

const User = sequelize.models.User;

router.post('/register', async (req, res) => {
    const user = await User.create({
        email: req.body.username,
        password: req.body.password,
    })
    return res.json({jwt: generateAccessToken(user)});
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    // if the username / password is missing, we use status code 400
    // indicating a bad request was made and send back a message
    if (!username || !password) {
        return res.status(400).send(
            'Request missing username or password param'
        );
    }
  
    let user = await User.authenticate(username, password);
  
    if (user) {
        // Create JWT and return
        return res.json({jwt: generateAccessToken(user)});
    } else {
        return res.sendStatus(403);
    }
});

router.get('/check-token', authenticateToken, async (req, res) => {
    // If we've got here, our token is good
    return res.sendStatus(200);
});


module.exports = router;
