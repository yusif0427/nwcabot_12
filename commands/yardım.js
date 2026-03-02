const { Client, EmbedBuilder } = require("discord.js");
const Discord = require("discord.js")
const { createButton, deleteMessageButton } = require("../function/functions");
const config = require("../config.json"); 

module.exports = {
  name: "yardım",
  description: " Botun yardım menüsüne bakarsın!",
  type: 1,
  options: [],

  run: async(client, interaction) => {

    const embed = new EmbedBuilder()
    .setAuthor({ name: "Yardım Menüsü", iconURL: client.user.displayAvatarURL({ dynamic: true })})
    .setTitle("・Hangi komutlarım hakkında bilgi almak istiyorsan o butona bas!")
    .setDescription("\n\n**Linkler**\n> ・**Botun davet linki: [Tıkla](" + config["bot-davet"] + ")**\n> ・**Botun destek sunucusu: [Tıkla](" + config["desteksunucusu"] + ")**")
    .setColor('Blue')
    .setImage("https://cdn.discordapp.com/attachments/1455663459046916203/1470113015071248464/standard.gif?ex=698b6e70&is=698a1cf0&hm=1b0af6a4f1ca5acda75e8e3b3a4ef154246f0bdf98a50349412cff171272f6ff&")
    const row1 = new Discord.ActionRowBuilder()

    .addComponents(
        new Discord.ButtonBuilder()
            .setEmoji("🛡")
            .setLabel("Moderasyon")
            .setStyle(Discord.ButtonStyle.Primary)
            .setCustomId("moderasyon_"+interaction.user.id)
    )

    .addComponents(
        new Discord.ButtonBuilder()
            .setEmoji("🧾")
            .setLabel("Kayıt")
            .setStyle(Discord.ButtonStyle.Primary)
            .setCustomId("kayıt_"+interaction.user.id)
    )

    .addComponents(
      new Discord.ButtonBuilder()
          .setEmoji("👤")
          .setLabel("Kullanıcı")
          .setStyle(Discord.ButtonStyle.Primary)
          .setCustomId("kullanıcı_"+interaction.user.id)
  )
  .addComponents(
    new Discord.ButtonBuilder()
        .setEmoji("⚙")
        .setLabel("Sistemler")
        .setStyle(Discord.ButtonStyle.Primary)
        .setCustomId("sistemler_"+interaction.user.id)
)

  const row2 = new Discord.ActionRowBuilder()
  .addComponents(
            new Discord.ButtonBuilder()
            .setLabel("Koruma")
            .setStyle(Discord.ButtonStyle.Primary)
            .setEmoji("🛡")
            .setCustomId("korumasystem_"+interaction.user.id),
  )
  .addComponents(
    new Discord.ButtonBuilder()
        .setLabel("Ana Sayfa")
        .setStyle(Discord.ButtonStyle.Success)
        .setEmoji('🏠')
        .setDisabled(true)
        .setCustomId("anasayfa_"+interaction.user.id)
  )  
  .addComponents(
    new Discord.ButtonBuilder()
        .setEmoji("1039607063443161158")
        .setLabel(" ")
        .setStyle(Discord.ButtonStyle.Danger)
        .setCustomId("clearMessageButton_"+interaction.user.id)
)
   
   interaction.reply({embeds: [embed], components: [row1, row2]}).then(msg => {
    msg.createMessageComponentCollector(user => user.clicker.user.id == interaction.user.id).on('collect', async (button) => {

   })
   })
  }  

};