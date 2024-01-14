const config = require("./../../knexfile.js");
const knex = require("knex");

const db = knex(config);

module.exports = db;

// // use this on dev
// const config = require("./../../knexfile.js");
// import dotenv from "dotenv";
// const knex = require("knex");
// dotenv.config();

// const env: string = process.env.NODE_ENV || "development";
// const options: any = config[env];

// module.exports = knex(options);
