import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class User extends Model {}
  User.init({
    // Model attributes
    userId: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique : true
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      }
  }, {
    // Other model options
    sequelize, // We need to pass the connection instance
    modelName: 'User', // We need to choose the model name
    tableName: 'users' // Explicitly set the table name
  });

  return User;
};

