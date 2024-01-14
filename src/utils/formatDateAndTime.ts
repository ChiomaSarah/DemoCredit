const knex = require("../database/db");
export const getCurrentFormattedTime = async () => {
  const { time } = await knex("transactions")
    .select(knex.raw("CURRENT_TIMESTAMP as time"))
    .first();
  const currentTime = new Date(time);

  // Format date and time
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const formattedDate = currentTime.toLocaleDateString();

  return { formattedTime, formattedDate };
};
