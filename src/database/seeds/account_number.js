/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  return await knex("account_number_sequence")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("account_number_sequence").insert([
        { last_used_number: 7000005000 }, // You can set an appropriate starting number
      ]);
    });
};
