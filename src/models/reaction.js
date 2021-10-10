const reaction = (sequelize, Model, DataTypes) => {
  class Reaction extends Model { }
  Reaction.init({
    reactedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Reaction'
  });
  return Reaction;
}

module.exports = reaction;