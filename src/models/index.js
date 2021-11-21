require('dotenv').config()
const { Sequelize, Model, DataTypes } = require('sequelize');

// Load models files

const user = require('./user');
const message = require('./message');
const conversation = require('./conversation');
const reaction = require('./reaction');
const reactionType = require('./reactionType');
const attachment = require('./attachment');
const quotedMessage = require('./quotedMessage');

// Initialize Sequelize objects

let sequelize;

sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: process.env.DB_DIALECT,
});

// Initialize models
const User = user(sequelize, Model, DataTypes);
const Message = message(sequelize, Model, DataTypes);
const Conversation = conversation(sequelize, Model, DataTypes);
const Reaction = reaction(sequelize, Model, DataTypes);
const ReactionType = reactionType(sequelize, Model, DataTypes);
const Attachment = attachment(sequelize, Model, DataTypes);
const QuotedMessage = quotedMessage(sequelize, Model, DataTypes);

User.addScope('ordered', {
    order: [
        ['lastName', 'ASC'],
        ['firstName', 'ASC']
    ]
})


// Declare associations

// One to Many
User.hasMany(Message);
Message.belongsTo(User);

Conversation.hasMany(Message);
Message.belongsTo(Conversation);

Message.hasMany(Reaction);
Reaction.belongsTo(Message);

Message.hasMany(Attachment);
Attachment.belongsTo(Message);

Message.hasMany(QuotedMessage);
QuotedMessage.belongsTo(Message);

User.hasMany(Reaction, { onDelete: 'CASCADE' });
Reaction.belongsTo(User);

Reaction.belongsTo(ReactionType)

// Many to Many
User.belongsToMany(Conversation, { through: 'UserConversations' });
Conversation.belongsToMany(User, { through: 'UserConversations' });

// One to one
// Reaction.hasOne(ReactionType);

module.exports = sequelize;