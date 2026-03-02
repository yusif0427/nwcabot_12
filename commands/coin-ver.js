const { EmbedBuilder } = require("discord.js");
const db = require("croxydb");
const config = require("../config.json");

module.exports = {
  name: "coin-ver",
  description: "Sahip ozel coin ekleme komutu.",
  type: 1,
  options: [
    {
      name: "user",
      description: "Coin verilecek kullanici.",
      type: 6,
      required: true
    },
    {
      name: "miktar",
      description: "Verilecek coin miktari.",
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

    db.add(key, amount);
    balance += amount;

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("Coin Verildi")
      .setDescription(`${target} kullanicisine **${amount}** coin verildi.\nYeni bakiye: **${balance}**`);

    return interaction.reply({ embeds: [embed] });
  }
};
