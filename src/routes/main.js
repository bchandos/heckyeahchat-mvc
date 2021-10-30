const express = require('express');
const router = express.Router();
// const sequelize = require('../models');
// const { authenticateToken } = require('../jwt');

router.get('/', async (req, res) => {
    // Do nothing of importance
    return res.render('index.html', {name: 'Dorkman McQuibbly-Phish'});
})

module.exports = router;