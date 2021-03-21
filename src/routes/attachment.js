const express = require('express');
const router = express.Router();
const sequelize = require('../models');
const { authenticateToken } = require('../jwt');

const Attachment = sequelize.models.Attachment;

// CRUD 

router.get('/:id', authenticateToken, async (req, res) => {
    // Read an attachment
    const attachment = await Attachment.findByPk(req.params.id);
    return res.json(attachment);
})

router.post('/', authenticateToken, async (req, res) => {
    // Create an attachment
    const body = req.body;
    const attachment = await Attachment.create({
        type: body.type,
    })
    // handle the data here and create a url
    // attachment.url = url;
    attachment.setMessage(body.messageId);
    return res.json(attachment);
})

router.put('/:id', authenticateToken, async (req, res) => {
    // Update a message
    const attachmentId = req.params.id;
    const attachment = await Attachment.findByPk(attachmentId);
    attachment.type = req.body.type;
    // update contents somehow
    await attachment.save();
    return res.json(attachment);
})

router.delete('/:id', authenticateToken, async (req, res) => {
    const attachmentId = req.params.id;
    const attachment = await Message.findByPk(attachmentId);
    await attachment.destroy();
    return res.json(`Attachment with id ${req.params.id} destroyed`);
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