const reactionType = (sequelize, Model, DataTypes) => {
  class ReactionType extends Model {}
    ReactionType.init({
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false
      },
      image: {
          type: DataTypes.STRING,
          allowNull: true
      },
      unicode: {
        type: DataTypes.STRING,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'ReactionType'
    });
    return ReactionType;
  }

module.exports = reactionType;