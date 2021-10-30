const express = require('express');
const router = express.Router();
// const sequelize = require('../models');
// const { authenticateToken } = require('../jwt');

router.get('/', async (req, res) => {
    return res.render('../index.html', { name: "World" });
});

module.exports = router;