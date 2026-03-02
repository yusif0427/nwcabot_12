const { EmbedBuilder } = require("discord.js");
const db = require("croxydb");

const CHOICES = ["tas", "kagit", "makas"];

function outcome(player, bot) {
  if (player === bot) return "draw";
  if (
    (player === "tas" && bot === "makas") ||
    (player === "kagit" && bot === "tas") ||
    (player === "makas" && bot === "kagit")
  ) return "win";
  return "lose";
}

module.exports = {
  name: "rps",
  description: "Tas kagit makas oynarsin.",
  type: 1,
  options: [
    {
      name: "secim",
      description: "Secimini yap.",
      type: 3,
      required: true,
      choices: [
        { name: "tas", value: "tas" },
        { name: "kagit", value: "kagit" },
        { name: "makas", value: "makas" }
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

    const botChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];
    const result = outcome(choice, botChoice);

    if (result === "win") {
      db.add(key, bet);
      balance += bet;
    } else if (result === "lose") {
      db.subtract(key, bet);
      balance -= bet;
    }

    const embed = new EmbedBuilder()
      .setColor(result === "win" ? "Green" : result === "lose" ? "Red" : "Yellow")
      .setTitle("Tas Kagit Makas")
      .setDescription(
        `Sen: **${choice}**\nBot: **${botChoice}**\n` +
        `${result === "win" ? `Kazandin: **${bet}** coin` : result === "lose" ? `Kaybettin: **${bet}** coin` : "Berabere"}` +
        `\nYeni bakiye: **${balance}**`
      );

    return interaction.reply({ embeds: [embed] });
  }
};
