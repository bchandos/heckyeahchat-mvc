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
        sentAtPrettyDate: {
            type: DataTypes.VIRTUAL,
            get() {
                return new Date(this.sentAt).toLocaleDateString('en-US', {dateStyle: 'short', timeStyle: 'short'});
            },
        },
        sentAtPrettyTime: {
            type: DataTypes.VIRTUAL,
            get() {
                return new Date(this.sentAt).toLocaleTimeString('en-US', {timeStyle: 'short'});
            }
        },
    }, {
        sequelize,
        modelName: 'Message'
    });
    return Message;
}

module.exports = message;

