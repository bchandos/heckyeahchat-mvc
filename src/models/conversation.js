const conversation = (sequelize, Model, DataTypes) => {
    class Conversation extends Model {}
    Conversation.init({
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      }
    }, {
        sequelize,
        modelName: 'Conversation'
    });
    return Conversation;
}

module.exports = conversation;