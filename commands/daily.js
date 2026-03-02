const { EmbedBuilder } = require("discord.js");
const db = require("croxydb");

const DAY_MS = 24 * 60 * 60 * 1000;

function formatMs(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${hours}h ${minutes}m ${seconds}s`;
}

module.exports = {
  name: "daily",
  description: "Gunluk coin odulunu alirsin.",
  type: 1,
  options: [],

  run: async (client, interaction) => {
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const coinKey = `coin_${guildId}_${userId}`;
    const dailyKey = `daily_${guildId}_${userId}`;

    let balance = db.get(coinKey);
    if (typeof balance !== "number") {
      balance = 100;
      db.set(coinKey, balance);
    }

    const now = Date.now();
    const last = db.get(dailyKey);
    if (typeof last === "number" && now - last < DAY_MS) {
      const remaining = DAY_MS - (now - last);
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Gunluk Odul")
        .setDescription(`Daha erken. Kalan sure: **${formatMs(remaining)}**`);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const reward = Math.floor(Math.random() * 151) + 100;
    db.add(coinKey, reward);
    db.set(dailyKey, now);

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("Gunluk Odul")
      .setDescription(`**${reward}** coin kazandin. Yeni bakiye: **${balance + reward}**`);

    return interaction.reply({ embeds: [embed] });
  }
};
