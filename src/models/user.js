const bcrypt = require('bcrypt');

const user = (sequelize, Model, DataTypes) => {
    class User extends Model {
        static async authenticate(email, password) {
            const user = await this.findOne({ where: { email: email }});
            if (user && bcrypt.compareSync(password, user.password)) {
                return user;
            } 
            return null;
        }
    }
    User.init({
        firstName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        nickname: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        admin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    }, {
        hooks: {
            beforeCreate: async (user, options) => {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                user.password = hashedPassword;
            }
        },
        sequelize,
        modelName: 'User'
    });
    return User;
}

module.exports = user;

