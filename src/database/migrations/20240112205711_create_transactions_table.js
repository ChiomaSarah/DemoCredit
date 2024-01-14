/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("transactions", function (table) {
    table.increments("transaction_id").primary();
    table.integer("user_id").unsigned().notNullable();
    table.bigInteger("sender_account_number").notNullable();
    table.string("sender_account_name").notNullable();
    table.bigInteger("receiver_account_number").notNullable();
    table.string("receiver_account_name").notNullable();
    table.decimal("amount", 10, 2).notNullable();
    table.string("type").notNullable();
    table.string("reference").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());

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
  return knex.schema.dropTable("transactions");
};
