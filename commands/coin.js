const { EmbedBuilder } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "coin",
  description: "Coin bakiyeni gorursun.",
  type: 1,
  options: [
    {
      name: "user",
      description: "Baska bir kullanicinin bakiyesi.",
      type: 6,
      required: false
    }
  ],

  run: async (client, interaction) => {
    const target = interaction.options.getUser("user") || interaction.user;
    const key = `coin_${interaction.guild.id}_${target.id}`;
    let balance = db.get(key);
    if (typeof balance !== "number") {
      balance = 100;
      db.set(key, balance);
    }

    const embed = new EmbedBuilder()
      .setColor("Gold")
      .setTitle("Coin Bakiye")
      .setDescription(`${target} kullanicisinin bakiyesi: **${balance}** coin`);

    return interaction.reply({ embeds: [embed] });
  }
};
