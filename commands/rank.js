const { AttachmentBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "rank",
  description: "Rank kartini gosterir.",
  type: 1,
  options: [
    {
      name: "kullanici",
      description: "Rankini gormek istediginiz kullaniciyi etiketleyin.",
      type: 6,
      required: false,
    },
  ],

  run: async (client, interaction, db) => {
    const { user, guild } = interaction;
    const targetUser = interaction.options.getUser("kullanici") || user;

    const level = db.get(`levelPos_${targetUser.id}${guild.id}`) || 0;
    const xp = db.get(`xpPos_${targetUser.id}${guild.id}`) || 0;
    const xpMax = 99;
    const progress = Math.max(0, Math.min(1, xp / xpMax));
    const percent = Math.round(progress * 100);

    const usersWithRank = client.users.cache
      .filter((u) => !u.bot)
      .map((u) => ({
        id: u.id,
        level: db.fetch(`levelPos_${u.id}${guild.id}`) || 0,
        xp: db.fetch(`xpPos_${u.id}${guild.id}`) || 0,
      }));

    if (!usersWithRank.some((u) => u.id === targetUser.id)) {
      usersWithRank.push({ id: targetUser.id, level, xp });
    }

    usersWithRank.sort((a, b) => b.level - a.level || b.xp - a.xp);
    const rankIndex = usersWithRank.findIndex((u) => u.id === targetUser.id);
    const rank = rankIndex >= 0 ? rankIndex + 1 : usersWithRank.length + 1;

    let Canvas;
    try {
      Canvas = require("canvas");
    } catch {
      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle(`${targetUser.username} Rank`)
        .setDescription(
          `RANK: **#${rank}**\nLEVEL: **${level}**\nXP: **${xp} / ${xpMax}** (${percent}%)`
        )
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    const width = 900;
    const height = 260;
    const canvas = Canvas.createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const roundRect = (x, y, w, h, r) => {
      const radius = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + w, y, x + w, y + h, radius);
      ctx.arcTo(x + w, y + h, x, y + h, radius);
      ctx.arcTo(x, y + h, x, y, radius);
      ctx.arcTo(x, y, x + w, y, radius);
      ctx.closePath();
    };

    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, "#1f2328");
    bg.addColorStop(1, "#2c3238");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = "#1b1f24";
    roundRect(20, 20, width - 40, height - 40, 18);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "#232a31";
    roundRect(40, 40, width - 80, height - 80, 14);
    ctx.fill();

    const avatarSize = 120;
    const avatarX = 70;
    const avatarY = 70;
    const avatar = await Canvas.loadImage(
      targetUser.displayAvatarURL({ extension: "png", size: 256 })
    );

    ctx.save();
    ctx.beginPath();
    ctx.arc(
      avatarX + avatarSize / 2,
      avatarY + avatarSize / 2,
      avatarSize / 2 + 4,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "#0f1114";
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(
      avatarX + avatarSize / 2,
      avatarY + avatarSize / 2,
      avatarSize / 2,
      0,
      Math.PI * 2
    );
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    ctx.font = "bold 28px Sans";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(targetUser.username, 220, 92);

    ctx.font = "20px Sans";
    ctx.fillStyle = "#a8b0b8";
    ctx.fillText(`RANK #${rank}`, 220, 128);
    ctx.fillText(`LEVEL ${level}`, 360, 128);

    const barX = 220;
    const barY = 155;
    const barW = 620;
    const barH = 28;

    ctx.fillStyle = "#15191e";
    roundRect(barX, barY, barW, barH, 14);
    ctx.fill();

    const fillW = Math.max(6, Math.floor(barW * progress));
    const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    barGrad.addColorStop(0, "#4fc3ff");
    barGrad.addColorStop(1, "#2a7bff");
    ctx.fillStyle = barGrad;
    roundRect(barX, barY, fillW, barH, 14);
    ctx.fill();

    ctx.font = "18px Sans";
    ctx.fillStyle = "#e5edf5";
    ctx.fillText(`${xp} / ${xpMax}`, barX, barY - 10);
    ctx.textAlign = "right";
    ctx.fillText(`${percent}%`, barX + barW, barY - 10);
    ctx.textAlign = "left";

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "rank.png" });
    await interaction.reply({ files: [attachment] });
  },
};
