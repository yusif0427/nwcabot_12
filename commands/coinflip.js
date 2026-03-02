const { EmbedBuilder } = require("discord.js");
const db = require("croxydb");

module.exports = {
  name: "coinflip",
  description: "Yazi tura oyunu oynarsin.",
  type: 1,
  options: [
    {
      name: "secim",
      description: "Yazi ya da tura.",
      type: 3,
      required: true,
      choices: [
        { name: "yazi", value: "yazi" },
        { name: "tura", value: "tura" }
      ]
    },
    {
      name: "miktar",
      description: "Bahis miktari.",
      type: 4,
      required: true
    }
  ],

  run: async (client, interaction) => {
    const choice = interaction.options.getString("secim");
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

    const result = Math.random() < 0.5 ? "yazi" : "tura";
    const win = choice === result;

    if (win) {
      db.add(key, bet);
      balance += bet;
    } else {
      db.subtract(key, bet);
      balance -= bet;
    }

    const embed = new EmbedBuilder()
      .setColor(win ? "Green" : "Red")
      .setTitle("Coinflip")
      .setDescription(`Sonuc: **${result}**\n${win ? "Kazandin" : "Kaybettin"}: **${bet}** coin\nYeni bakiye: **${balance}**`);

    return interaction.reply({ embeds: [embed] });
  }
};
