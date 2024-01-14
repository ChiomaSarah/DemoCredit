// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */

const dotenv = require("dotenv");
dotenv.config();

// config to run knex on hosted server (prod)
module.exports = {
  client: "mysql2",
  connection: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false },
  },
  migrations: {
    directory: "./src/database/migrations",
  },
  seeds: {
    directory: "./src/database/seeds",
  },
};

// // Config to run knex on dev.
// module.exports = {
//   development: {
//     client: "mysql2",
//     connection: {
//       user: process.env.DB_USER,
//       password: process.env.DB_PASSWORD,
//       database: process.env.DB_NAME,
//     },
//     migrations: {
//       directory: "./src/database/migrations",
//     },
//     seeds: {
//       directory: "./src/database/seeds",
//     },
//   },

//   production: {
//     client: "mysql2",
//     connection: {
//       user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     ssl: { rejectUnauthorized: false },
//     },
//     migrations: {
//       directory: "./src/database/migrations",
//     },
//     seeds: {
//       directory: "./src/database/seeds",
//     },
//   },
// };
