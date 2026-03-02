const { EmbedBuilder } = require("discord.js");
const db = require("croxydb");
const config = require("../config.json");

module.exports = {
  name: "coin-al",
  description: "Sahip ozel coin dusme komutu.",
  type: 1,
  options: [
    {
      name: "user",
      description: "Coin dusulecek kullanici.",
      type: 6,
      required: true
    },
    {
      name: "miktar",
      description: "Dusulecek coin miktari.",
      type: 4,
      required: true
    }
  ],

  run: async (client, interaction) => {
    if (interaction.user.id !== config.sahip) {
      return interaction.reply({ content: "Bu komut sadece bot sahibine ozeldir.", ephemeral: true });
    }

    const target = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("miktar");

    if (!Number.isInteger(amount) || amount < 1) {
      return interaction.reply({ content: "Miktar en az 1 olmali.", ephemeral: true });
    }

    const key = `coin_${interaction.guild.id}_${target.id}`;
    let balance = db.get(key);
    if (typeof balance !== "number") {
      balance = 100;
      db.set(key, balance);
    }

    const newBalance = Math.max(0, balance - amount);
    db.set(key, newBalance);

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("Coin Dusuldu")
      .setDescription(`${target} kullanicisindan **${amount}** coin dusuldu.\nYeni bakiye: **${newBalance}**`);

    return interaction.reply({ embeds: [embed] });
  }
};
