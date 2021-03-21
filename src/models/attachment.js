const attachment = (sequelize, Model, DataTypes) => {
  class Attachment extends Model {}
    Attachment.init({
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['photo', 'link', 'video', 'audio']],
        }
      },
      url: {
        // URL to attachment
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true,
        }
      }
    }, {
      sequelize,
      modelName: 'Attachment'
    });
    return Attachment;
  }

module.exports = attachment;