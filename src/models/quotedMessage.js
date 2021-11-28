const quotedMessage = (sequelize, Model, DataTypes) => {
  class QuotedMessage extends Model {}
    QuotedMessage.init({}, {
      sequelize,
      modelName: 'QuotedMessage'
    });
    return QuotedMessage;
  }

module.exports = quotedMessage;