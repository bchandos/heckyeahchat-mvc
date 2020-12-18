const message = (sequelize, Model, DataTypes) => {
    class Message extends Model {}
    Message.init({
        text: {
            type: DataTypes.STRING,
            allowNull: false
        },
        sentAt: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Message'
    });
    return Message;
}

module.exports = message;

