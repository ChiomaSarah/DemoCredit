// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
// module.exports = {
export const development = {
  client: "mysql",
  connection: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  migrations: {
    directory: "./src/database/migrations",
  },
};

export const production = {
  client: "mysql",
  connection: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  migrations: {
    directory: "./src/database/migrations",
  },
};
// };
