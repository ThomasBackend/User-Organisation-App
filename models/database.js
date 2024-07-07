import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { Sequelize, DataTypes } from 'sequelize';
import { fileURLToPath, pathToFileURL } from 'url';

dotenv.config();

// Convert import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust this to point to the correct directory where your model files are located
const modelsDir = path.join(__dirname, '.'); // Assuming models are in the same directory

// const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   dialect: 'postgres',
//   logging: false,
// });

const sequelize = new Sequelize(process.env.POSTGRES_DATABASE, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true, // Enable SSL connection
      rejectUnauthorized: false // Accept self-signed certificates (if applicable)
    }
  },
  logging: false, // Disable logging SQL queries
});

const db = {};

async function loadModels() {
  try {
    const files = await fs.readdir(modelsDir);
    for (const file of files) {
      if (file.endsWith('.js') && file !== path.basename(__filename)) {
        const modelPath = path.join(modelsDir, file);
        const model = (await import(pathToFileURL(modelPath).href)).default;
        const modelInstance = model(sequelize, DataTypes);
        db[modelInstance.name] = modelInstance;
      }
    }

    // Define associations if available
    Object.keys(db).forEach(modelName => {
      if (db[modelName].associate) {
        db[modelName].associate(db);
      }
    });

    // Check if required tables exist
    const tableExists = await sequelize.getQueryInterface().showAllTables();
    const shouldSync = !(
      tableExists.includes('organisations') &&
      tableExists.includes('users') &&
      tableExists.includes('userorganisations')
    );

    // Synchronize all defined models to the database if necessary
    if (shouldSync) {
      await sequelize.sync({ force: false });
      console.log('Database synchronized.');
    } else {
      console.log('Tables already exist, skipping synchronization.');
    }

    // Log synchronized models and their table names
    Object.keys(db).forEach(modelName => {
      const model = db[modelName];
      if (model && model.tableName) {
        console.log(`Model '${modelName}' synchronized to table '${model.tableName}'`);
      } else {
        console.warn(`Model '${modelName}' does not have a tableName defined.`);
      }
    });

  } catch (err) {
    console.error('Error loading models:', err);
  }
}

// Call the function to load models and synchronize database
loadModels();

// Assign sequelize instance and models to db object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Authenticate with the database
sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Export the db object containing Sequelize and models
export default db;
