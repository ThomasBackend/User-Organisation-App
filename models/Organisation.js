import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class Organisation extends Model {}
  Organisation.init({
    // Model attributes
    orgId: {
        type: DataTypes.STRING,
        primaryKey: true,
        unique : true
      },
      name: {
        type: DataTypes.STRING,
        required: true,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      }
  }, {
    // Other model options
    sequelize, // We need to pass the connection instance
    modelName: 'Organisation', // We need to choose the model name
    tableName: 'organisations' // Explicitly set the table name
  });

  return Organisation;
};