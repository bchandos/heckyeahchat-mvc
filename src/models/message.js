const message = (sequelize, Model, DataTypes) => {
    class Message extends Model {}
    Message.init({
        text: {
            type: DataTypes.STRING,
            allowNull: false
        },
        size: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        sentAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'Message'
    });
    return Message;
}

module.exports = message;

