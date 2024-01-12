export async function generateAccountNumber(knex: any) {
  try {
    const { last_used_number } = await knex("account_number_sequence")
      .select("last_used_number")
      .first();

    const nextAccountNumber = last_used_number + 1;

    await knex("account_number_sequence").update({
      last_used_number: nextAccountNumber,
    });

    return nextAccountNumber;
  } catch (error) {
    console.error("Error generating account number:", error);
    throw error;
  }
}
