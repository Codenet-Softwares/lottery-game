import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import mysql2 from 'mysql2/promise';


dotenv.config();

const sequelize = new Sequelize(process.env.DB_DBNAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: "mysql",
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  }
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection established.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

  export const sql = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DBNAME,
    multipleStatements: true,
  });


  // Archive Database Connection

  const sequelizeArchive = new Sequelize(process.env.ARCHIVE_DBNAME, process.env.ARCHIVE_DB_USER, process.env.ARCHIVE_DB_PASSWORD, {
    host: process.env.ARCHIVE_DB_HOST,
    dialect: "mysql",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    }
  });
  
  sequelizeArchive
    .authenticate()
    .then(() => {
      console.log("Database connection established for archive database.");
    })
    .catch((err) => {
      console.error("Unable to connect to the archive database:", err);
    });
  
    export const sqlArchive = mysql2.createPool({
      host: process.env.ARCHIVE_DB_HOST,
      user: process.env.ARCHIVE_DB_USER,
      password: process.env.ARCHIVE_DB_PASSWORD,
      database: process.env.ARCHIVE_DBNAME,
      multipleStatements: true,
    });

export  { sequelizeArchive, sequelize };