const { EmbedBuilder } = require("discord.js");
const db = require("croxydb");

function extractEntries(all) {
  if (Array.isArray(all)) {
    return all.map((item) => {
      const key = item.id || item.ID || item.key;
      const value = item.data ?? item.value ?? item.val ?? item;
      return [key, value];
    });
  }
  return Object.entries(all || {});
}

module.exports = {
  name: "coin-top",
  description: "En zenginleri gosterir.",
  type: 1,
  options: [],

  run: async (client, interaction) => {
    const prefix = `coin_${interaction.guild.id}_`;
    const entries = extractEntries(db.all());

    const items = entries
      .filter(([key, value]) => typeof key === "string" && key.startsWith(prefix) && typeof value === "number")
      .map(([key, value]) => ({ userId: key.slice(prefix.length), balance: value }))
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 10);

    if (items.length === 0) {
      return interaction.reply({ content: "Henuz coin verisi yok.", ephemeral: true });
    }

    const lines = items.map((item, index) => {
      const label = `<@${item.userId}>`;
      return `${index + 1}. ${label} - **${item.balance}**`;
    });

    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("Coin Siralamasi")
      .setDescription(lines.join("\n"));

    return interaction.reply({ embeds: [embed] });
  }
};
