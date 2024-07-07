import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class UserOrganisation extends Model {}
  UserOrganisation.init({
    // Model attributes
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique : true
      },
      orgId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
      }
  }, {
    // Other model options
    sequelize, // We need to pass the connection instance
    modelName: 'UserOrganisation', // We need to choose the model name
    tableName: 'userorganisations' // Explicitly set the table name
  });

  return UserOrganisation;
};