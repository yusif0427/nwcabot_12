const { EmbedBuilder } = require("discord.js");
const db = require("croxydb");
const config = require("../config.json");

module.exports = {
  name: "coin-set",
  description: "Sahip ozel coin ayarlama komutu.",
  type: 1,
  options: [
    {
      name: "user",
      description: "Coini ayarlanacak kullanici.",
      type: 6,
      required: true
    },
    {
      name: "miktar",
      description: "Yeni bakiye miktari.",
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

    if (!Number.isInteger(amount) || amount < 0) {
      return interaction.reply({ content: "Miktar 0 veya daha buyuk olmali.", ephemeral: true });
    }

    const key = `coin_${interaction.guild.id}_${target.id}`;
    db.set(key, amount);

    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("Coin Ayarlandi")
      .setDescription(`${target} kullanicisina yeni bakiye **${amount}** olarak ayarlandi.`);

    return interaction.reply({ embeds: [embed] });
  }
};
