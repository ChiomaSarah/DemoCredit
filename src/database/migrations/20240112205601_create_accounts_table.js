/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("accounts", function (table) {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable();
    table.string("account_no").notNullable();
    table.decimal("balance", 10, 2).notNullable().defaultTo(0);
    table.string("firstname");
    table.string("lastname");
    table.timestamp("created_at").defaultTo(knex.fn.now());

    // Foreign key referencing the 'id' column in the 'users' table.
    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("accounts");
};
