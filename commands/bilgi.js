const { EmbedBuilder } = require("discord.js");
const db = require("croxydb");

const STATUS_MAP = {
  online: "Çevrimiçi",
  idle: "Boşta",
  dnd: "Rahatsız Etmeyin",
  offline: "Çevrimdışı"
};

const formatDate = (timestamp) => {
  if (!timestamp) return "Bilinmiyor";
  return `<t:${Math.floor(timestamp / 1000)}:f>`;
};

const formatRelative = (timestamp) => {
  if (!timestamp) return "Bilinmiyor";
  return `<t:${Math.floor(timestamp / 1000)}:R>`;
};

const formatDuration = (ms) => {
  if (!Number.isFinite(ms) || ms < 0) return "Bilinmiyor";
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} gün ${hours % 24} saat`;
  if (hours > 0) return `${hours} saat ${minutes % 60} dk`;
  if (minutes > 0) return `${minutes} dk`;
  return `${seconds} sn`;
};

module.exports = {
  name: "bilgi",
  description: "Kullanıcıya ait detaylı bilgi kartı.",
  type: 1,
  options: [
    {
      name: "kullanici",
      description: "İnceleyeceğiniz kullanıcıyı seçin.",
      type: 6,
      required: false
    }
  ],

  run: async (client, interaction) => {
    const targetMember =
      interaction.options.getMember("kullanici") || interaction.member;

    if (!targetMember) {
      return interaction.reply({ content: "Kullanıcı bulunamadı.", ephemeral: true });
    }

    const user = targetMember.user;
    const createdAt = user.createdTimestamp;
    const joinedAt = targetMember.joinedTimestamp;
    const joinDuration = joinedAt ? Date.now() - joinedAt : null;
    const discordDays = Math.floor((Date.now() - createdAt) / 86_400_000);
    const status = STATUS_MAP[targetMember.presence?.status] || "Çevrimdışı";
    const roles = targetMember.roles.cache.filter((r) => r.id !== interaction.guild.id);
    const permissions = targetMember.permissions.has("Administrator") ? "Yönetici" : "Standart";
    const voiceState = targetMember.voice;
    const voiceStatus = voiceState?.channel
      ? `${voiceState.channel.name} (${voiceState.channelId})`
      : "Ses kanalında değil";

    const warningCount = db.get(`${interaction.guild.id}.${targetMember.id}`) || 0;
    const banCount = db.get(`ban_${interaction.guild.id}_${targetMember.id}`) || 0;
    const muteCount = db.get(`mute_${interaction.guild.id}_${targetMember.id}`) || 0;
    const jailCount = db.get(`jail_${interaction.guild.id}_${targetMember.id}`) || 0;
    const registerCount = db.get(`kayıt_${interaction.guild.id}_${targetMember.id}`) || 0;
    const ticketCount = db.get(`ticket_${interaction.guild.id}_${targetMember.id}`) || 0;

    let bannerUrl = null;
    try {
      const fetched = await user.fetch();
      bannerUrl = fetched.bannerURL({ size: 2048, dynamic: true });
    } catch {
      bannerUrl = null;
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: "Marple | Kullanıcı Bilgi Kartı",
        iconURL: client.user.displayAvatarURL({ dynamic: true })
      })
      .setTitle(`${user.tag} Kişisinin Genel Bilgileri:`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setColor("#4F46E5")
      .addFields(
        {
          name: "⭐ Genel Bilgiler",
          value: [
            `• Takma Ad: **${targetMember.displayName}**`,
            `• Aktiflik Durumu: **${status}**`,
            `• Rol Sayısı: **${roles.size}**`,
            `• Discord'a Katılım: **${discordDays} gün**`,
            `• Kayıt Tarihi: ${formatDate(createdAt)} (${formatRelative(createdAt)})`
          ].join("\n")
        },
        {
          name: "🏠 Sunucu İstatistikleri",
          value: [
            `• Sunucuya Katılım: ${formatDuration(Date.now() - joinedAt)}`,
            `• Giriş Tarihi: ${formatDate(joinedAt)} (${formatRelative(joinedAt)})`,
            `• Ses Suresi: **${voiceStatus}**`,
            `• Üyenin İzinleri: **${permissions}**`
          ].join("\n")
        },
        {
          name: "🛡️ Yetkili İstatistikleri",
          value: [
            `• Ban Sayısı: **${banCount}**`,
            `• Mute Sayısı: **${muteCount}**`,
            `• Jail Sayısı: **${jailCount}**`,
            `• Kayıt Sayısı: **${registerCount}**`,
            `• Talep Çözümü Sayısı: **${ticketCount}**`,
            `• Uyarı Sayısı: **${warningCount}**`
          ].join("\n")
        }
      )
      .setFooter({
        text: `Marple • İsteyen: ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      });

    if (bannerUrl) {
      embed.addFields({ name: "🏴‍☠️ Banner", value: "Aşağıdaki görsel banner'dır." });
      embed.setImage(bannerUrl);
    }

    return interaction.reply({ embeds: [embed] });
  }
};
