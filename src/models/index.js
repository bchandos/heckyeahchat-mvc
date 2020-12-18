require('dotenv').config()
const { Sequelize, Model, DataTypes } = require('sequelize');

// Load models files

const user = require('./user');
const message = require('./message');
const conversation = require('./conversation');

// Initialize Sequelize objects

let sequelize;

sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: process.env.DB_DIALECT,
});

// Initialize models
const User = user(sequelize, Model, DataTypes);
const Message = message(sequelize, Model, DataTypes);
const Conversation = conversation(sequelize, Model, DataTypes);

User.addScope('ordered', {
    order: [
        ['lastName', 'ASC'],
        ['firstName', 'ASC']
    ]
})


// Declare associations

User.hasMany(Message);
Message.belongsTo(User);

User.belongsToMany(Conversation, { through: 'UserConversations' });
Conversation.belongsToMany(User, { through: 'UserConversations' });

Conversation.hasMany(Message);
Message.belongsTo(Conversation);

module.exports = sequelize;