const quotedMessage = (sequelize, Model, DataTypes) => {
  class QuotedMessage extends Model {}
    QuotedMessage.init({
      quotedMessageId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'QuotedMessage'
    });
    return QuotedMessage;
  }

module.exports = quotedMessage;