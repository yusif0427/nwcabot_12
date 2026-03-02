const { EmbedBuilder } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "zar",
  description: "Zar oyunu oynarsin.",
  type: 1,
  options: [
    {
      name: "tahmin",
      description: "1-6 arasi tahmin.",
      type: 4,
      required: true
    },
    {
      name: "miktar",
      description: "Bahis miktari.",
      type: 4,
      required: true
    }
  ],

  run: async (client, interaction) => {
    const guess = interaction.options.getInteger("tahmin");
    const bet = interaction.options.getInteger("miktar");
    const key = `coin_${interaction.guild.id}_${interaction.user.id}`;

    let balance = db.get(key);
    if (typeof balance !== "number") {
      balance = 100;
      db.set(key, balance);
    }

    if (!Number.isInteger(guess) || guess < 1 || guess > 6) {
      return interaction.reply({ content: "Tahmin 1-6 arasinda olmali.", ephemeral: true });
    }
    if (!Number.isInteger(bet) || bet < 1) {
      return interaction.reply({ content: "Bahis miktari en az 1 olmalidir.", ephemeral: true });
    }
    if (bet > balance) {
      return interaction.reply({ content: "Yeterli coin yok.", ephemeral: true });
    }

    const roll = Math.floor(Math.random() * 6) + 1;
    const win = guess === roll;

    if (win) {
      const prize = bet * 5;
      db.add(key, prize);
      balance += prize;
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("Zar")
        .setDescription(`Zar: **${roll}**\nKazandin: **${prize}** coin\nYeni bakiye: **${balance}**`);
      return interaction.reply({ embeds: [embed] });
    }

    db.subtract(key, bet);
    balance -= bet;
    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("Zar")
      .setDescription(`Zar: **${roll}**\nKaybettin: **${bet}** coin\nYeni bakiye: **${balance}**`);

    return interaction.reply({ embeds: [embed] });
  }
};
