const { EmbedBuilder } = require("discord.js");
const db = require("croxydb");

const ICONS = ["CHERRY", "LEMON", "BELL", "BAR", "SEVEN"];

module.exports = {
  name: "slot",
  description: "Slot oyunu oynarsin.",
  type: 1,
  options: [
    {
      name: "miktar",
      description: "Bahis miktari.",
      type: 4,
      required: true
    }
  ],

  run: async (client, interaction) => {
    const bet = interaction.options.getInteger("miktar");
    const key = `coin_${interaction.guild.id}_${interaction.user.id}`;

    let balance = db.get(key);
    if (typeof balance !== "number") {
      balance = 100;
      db.set(key, balance);
    }

    if (!Number.isInteger(bet) || bet < 1) {
      return interaction.reply({ content: "Bahis miktari en az 1 olmalidir.", ephemeral: true });
    }
    if (bet > balance) {
      return interaction.reply({ content: "Yeterli coin yok.", ephemeral: true });
    }

    const a = ICONS[Math.floor(Math.random() * ICONS.length)];
    const b = ICONS[Math.floor(Math.random() * ICONS.length)];
    const c = ICONS[Math.floor(Math.random() * ICONS.length)];

    let winAmount = 0;
    if (a === b && b === c) {
      winAmount = bet * 4;
    } else if (a === b || a === c || b === c) {
      winAmount = bet * 2;
    }

    if (winAmount > 0) {
      db.add(key, winAmount);
      balance += winAmount;
    } else {
      db.subtract(key, bet);
      balance -= bet;
    }

    const embed = new EmbedBuilder()
      .setColor(winAmount > 0 ? "Green" : "Red")
      .setTitle("Slot")
      .setDescription(
        `| ${a} | ${b} | ${c} |\n` +
        `${winAmount > 0 ? `Kazandin: **${winAmount}** coin` : `Kaybettin: **${bet}** coin`}\n` +
        `Yeni bakiye: **${balance}**`
      );

    return interaction.reply({ embeds: [embed] });
  }
};
