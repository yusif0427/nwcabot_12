const db = require("croxydb");
const { PermissionFlagsBits, EmbedBuilder, Events, PermissionsBitField  } = require("discord.js");
const Discord = require("discord.js")
const config = require("../config.json");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "messageCreate",
    once: false,
    run: async (client, message) => {
        try {
            if (message.author.bot) return;
            if (!message.guild) {
                const dmAutoReply = typeof config.dmAutoReply === "string" ? config.dmAutoReply.trim() : "";
                if (dmAutoReply.length > 0) {
                    await message.reply(dmAutoReply);
                }
                return;
            }

            const OWNER_ID = "1383133767945945219";
            const CONTROL_PREFIX = String(config.prefix || "N!").toLowerCase();
            const SERVER_SHARE_LINK = "https://www.roblox.com/share?code=76c96a36b34f394fa1ff64c1ac0300d8&type=Server";
            const PP_IMAGE_URL = "https://static.flickr.com/113/308555369_72c545ec49_b.jpg";
            const PP_LOCAL_IMAGE_CANDIDATES = [
                path.join(__dirname, "..", "assets", "pp.png"),
                path.join(__dirname, "..", "assets", "pp.jpg"),
                path.join(__dirname, "..", "assets", "pp.jpeg")
            ];
            const rawContent = message.content.trim();
            const lowerContent = rawContent.toLowerCase();
            const botKapali = db.fetch("bot_kapali") ? true : false;

            if (botKapali && message.author.id !== OWNER_ID) return;

            if (lowerContent === "!server" || lowerContent === `${CONTROL_PREFIX}server`) {
                await message.reply(`Sunucu linki: ${SERVER_SHARE_LINK}`);
                return;
            }

            if (lowerContent === "!!pp") {
                const localImage = PP_LOCAL_IMAGE_CANDIDATES.find((filePath) => fs.existsSync(filePath));
                await message.channel.send({
                    content: "bu sensin profilin :D",
                    files: [localImage || PP_IMAGE_URL]
                });
                return;
            }

            if (lowerContent.startsWith(CONTROL_PREFIX) && message.author.id === OWNER_ID) {
                console.log(`[debug] control cmd: ${message.content}`);
                const cmd = lowerContent.slice(CONTROL_PREFIX.length).trim().split(/\s+/)[0];

                if (cmd === "test") {
                    await message.reply("test ok");
                    return;
                }

                if (cmd === "kapat") {
                    db.set("bot_kapali", true);
                    await message.reply("Bot kapatıldı.");
                    return;
                }

                if (cmd === "baslat") {
                    db.delete("bot_kapali");
                    await message.reply("Bot başlatıldı.");
                    return;
                }

                if (cmd === "yeniden" || cmd === "yeinden") {
                    db.delete("bot_kapali");
                    await message.reply("Bot yeniden başlatılıyor...");
                    process.exit(0);
                    return;
                }
            }

            // Prefix komut desteği (slash komutları için basit uyumluluk katmanı)
            const prefix = String(config.prefix || "N!");
            if (lowerContent.startsWith(prefix.toLowerCase())) {
                const content = rawContent.slice(prefix.length).trim();
                if (content.length === 0) return;

                const args = [];
                const argRegex = /"([^"]+)"|'([^']+)'|(\S+)/g;
                let match;
                while ((match = argRegex.exec(content)) !== null) {
                    args.push(match[1] || match[2] || match[3]);
                }

                const commandName = (args.shift() || "").toLowerCase();
                if (!commandName) return;

                const command = client.commandMap ? client.commandMap.get(commandName) : null;
                if (!command || typeof command.run !== "function") return;

                const sanitizePayload = (payload) => {
                    if (!payload || typeof payload !== "object") return payload;
                    const cloned = { ...payload };
                    if ("ephemeral" in cloned) delete cloned.ephemeral;
                    return cloned;
                };

                const parseId = (raw, prefix, suffix) => {
                    if (!raw) return null;
                    if (raw.startsWith(prefix) && raw.endsWith(suffix)) {
                        return raw.slice(prefix.length, -suffix.length);
                    }
                    return raw;
                };

                const optionValues = {};
                const optionDefs = Array.isArray(command.options) ? command.options : [];
                let argIndex = 0;
                for (const opt of optionDefs) {
                    const raw = args[argIndex];
                    if (raw === undefined) {
                        optionValues[opt.name] = null;
                        continue;
                    }

                    let value = null;
                    switch (opt.type) {
                        case 3: // string
                            value = raw;
                            break;
                        case 4: // integer
                            value = Number.parseInt(raw, 10);
                            if (Number.isNaN(value)) value = null;
                            break;
                        case 10: // number
                            value = Number.parseFloat(raw);
                            if (Number.isNaN(value)) value = null;
                            break;
                        case 5: { // boolean
                            const v = raw.toLowerCase();
                            if (["true", "1", "yes", "evet", "on"].includes(v)) value = true;
                            else if (["false", "0", "no", "hayir", "off"].includes(v)) value = false;
                            else value = null;
                            break;
                        }
                        case 6: { // user
                            const id = parseId(raw, "<@!", ">") || parseId(raw, "<@", ">") || raw;
                            value = message.guild.members.cache.get(id)?.user || client.users.cache.get(id) || null;
                            break;
                        }
                        case 7: { // channel
                            const id = parseId(raw, "<#", ">") || raw;
                            value = message.guild.channels.cache.get(id) || null;
                            break;
                        }
                        case 8: { // role
                            const id = parseId(raw, "<@&", ">") || raw;
                            value = message.guild.roles.cache.get(id) || null;
                            break;
                        }
                        case 9: { // mentionable
                            const id = parseId(raw, "<@&", ">") || parseId(raw, "<@!", ">") || parseId(raw, "<@", ">") || raw;
                            value =
                                message.guild.roles.cache.get(id) ||
                                message.guild.members.cache.get(id)?.user ||
                                client.users.cache.get(id) ||
                                null;
                            break;
                        }
                        default:
                            value = raw;
                            break;
                    }

                    optionValues[opt.name] = value;
                    argIndex += 1;
                }

                const optionsResolver = {
                    getString: (name) => optionValues[name] ?? null,
                    getInteger: (name) => optionValues[name] ?? null,
                    getNumber: (name) => optionValues[name] ?? null,
                    getBoolean: (name) => optionValues[name] ?? null,
                    getUser: (name) => optionValues[name] ?? null,
                    getMember: (name) => {
                        const val = optionValues[name];
                        if (!val) return null;
                        if (val.user && val.id) return val;
                        return message.guild.members.cache.get(val.id || val) || null;
                    },
                    getChannel: (name) => optionValues[name] ?? null,
                    getRole: (name) => optionValues[name] ?? null
                };

                const fakeInteraction = {
                    client,
                    user: message.author,
                    member: message.member,
                    guild: message.guild,
                    channel: message.channel,
                    options: optionsResolver,
                    replied: false,
                    deferred: false,
                    reply: (payload) => {
                        const data = sanitizePayload(payload);
                        fakeInteraction.replied = true;
                        return message.reply(data);
                    },
                    followUp: (payload) => message.channel.send(sanitizePayload(payload)),
                    deferReply: async () => {
                        fakeInteraction.deferred = true;
                        return Promise.resolve();
                    },
                    editReply: (payload) => message.channel.send(sanitizePayload(payload)),
                    showModal: async () => {
                        return message.reply("Bu komut sadece `/` (slash) olarak kullanÄ±labilir.");
                    },
                    awaitModalSubmit: async () => {
                        return Promise.reject(new Error("Prefix ile modal desteklenmiyor."));
                    }
                };

                try {
                    await command.run(client, fakeInteraction);
                } catch (err) {
                    console.error("Prefix komut hatasÄ±:", err);
                }
                return;
            }

            const xp = db.fetch(`xpPos_${message.author.id}${message.guild.id}`);
            const levellog = db.fetch(`level_log_${message.guild.id}`);
            const level = db.fetch(`levelPos_${message.author.id}${message.guild.id}`);

            const acikmi = db.fetch(`acikmiLevel_${message.guild.id}`) ? true : false;
            if (acikmi) {
				if (xp >= 99) {
                    db.subtract(`xpPos_${message.author.id}${message.guild.id}`, xp);
                    db.add(`levelPos_${message.author.id}${message.guild.id}`, 1);

                    client.channels.cache.get(levellog).send(`${message.author} GG!, artık yeni seviyene ulaştın, tebrikler! Yeni seviyen: **${level + 1}**`);
                } else {
                    db.add(`xpPos_${message.author.id}${message.guild.id}`, 1);
                }
            }

            if (await db.get(`afk_${message.author.id}`)) {
                const afkDate = db.fetch(`afkDate_${message.author.id}`);
                const sebep = db.fetch(`afk_${message.author.id}`);

                if (afkDate && sebep) {
                    const date = `${message.author} Hoş geldin! **${sebep}** sebebiyle <t:${parseInt(afkDate.date / 1000)}:R> afk'ydın`;
                    db.delete(`afk_${message.author.id}`);
                    db.delete(`afkDate_${message.author.id}`);

                    message.reply(date);
                }
            }

            const kullanıcı = message.mentions.users.first();
            if (kullanıcı) {
                const afkDate = db.fetch(`afkDate_${kullanıcı.id}`);
                const sebep = await db.get(`afk_${kullanıcı.id}`);

                if (sebep) {
                    const sebeps = `❔ | Etiketlediğin kullanıcı **${sebep}** sebebiyle afk modunda!`;
                    message.reply(sebeps);
                }
            }

            const kufur = db.fetch(`kufurengel_${message.guild.id}`);

            if (kufur) {
                const kufurler = ["sikik","sikeyim", "piç", "yarrak", "oç", "göt", "orospu", "sikim", "sikeyim", "oruspu çocugu", "orospu","ailen oç", "Allahı sikeyim", "Allahı siktim öldü", "Allahın amk", "Allahını sikerim", "Allahını sikeyim", "Allah'ını sikeyim", "Allahini sikeyim", "Allah'ini sikeyim" ];
                if (kufurler.some((word) => message.content.toLowerCase().includes(word))) {
                  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    message.delete();
                    const embed = new EmbedBuilder()
                      .setTitle(`❗ **UYARI!**`)
                      .setDescription(`✋ | ${message.author}, Küfür etmeye devam edersen banlanacaksın!`);
                    const msg = await message.channel.send({ embeds: [embed] });
                    if (msg) setTimeout(() => msg.delete(), 5000);
                  }
                }
              }

            const reklamlar = db.fetch(`reklamengel_${message.guild.id}`);

            if (reklamlar) {
                const linkler = [".com.tr", ".net", ".org", ".tk", ".cf", ".gf", "https://", ".gq", "http://", ".com", ".gg", ".porn", ".edu"];

                if (linkler.some(alo => message.content.toLowerCase().includes(alo))) {
                    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
                    if (message.author.bot) return;

                    message.delete();
                    const embed = new EmbedBuilder()
                    .setTitle(`❗ **UYARI!**`)
                    .setDescription(`✋ | ${message.author}, Reklam atmaya devam edersen banlanacaksın!`);
                const msg = await message.channel.send({ embeds: [embed] });
                if (msg) setTimeout(() => msg.delete(), 5000);
                }
            }

            const kanal = db.get(`görselengel.${message.guild.id}`);
            if (message.channel.id == kanal) {
                if (!message.attachments.first()) {
                    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
                    if (message.author.bot) return;

                    message.delete();
                    const msg = await message.channel.send(`${message.author}, Bu Kanalda Sadece GIF & Resim Atabilirsiniz.`);
                    if (msg) setTimeout(() => msg.delete(), 5000);
                }
            }

            const data = db.fetch(`yasaklı_kelime_${message.guild.id}`);
if (data) {
    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
    if (message.author.bot) return;

    const mesajIcerigi = message.content.toLowerCase();
    const yasakliKelimeler = data.map(kelime => kelime.toLowerCase());

    for (const kelime of yasakliKelimeler) {
        if (mesajIcerigi.includes(kelime)) {
            await message.delete();
            const embed = new EmbedBuilder()
                .setTitle(`❗ **UYARI!**`)
                .setDescription(`✋ | ${message.author}, Yasaklı Kelime Kulanmayınız!`);
            const msg = await message.channel.send({ embeds: [embed] });
            if (msg) setTimeout(() => msg.delete(), 5000);
            break;
        }
    }
}

            const saas = db.fetch(`saas_${message.guild.id}`);

            if (saas) {
                const selaamlar = message.content.toLowerCase();
                if (selaamlar === 'sa' || selaamlar === 'slm' || selaamlar === 'sea' || selaamlar === ' selamünaleyküm' || selaamlar === 'selamün aleyküm' || selaamlar === 'selam') {
                    message.channel.send(`<@${message.author.id}> as cnm la naber 😋`);
                }
            }

            if (message.content.length > 4) {
                if (db.fetch(`capslockengel_${message.guild.id}`)) {
                    const caps = message.content.toUpperCase();
                    if (message.content === caps) {
                        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                            if (!message.mentions.users.first()) {
                                message.delete();
                                const embed = new EmbedBuilder()
                                    .setTitle(`❗ **UYARI!**`)
                                    .setDescription(`✋ | ${message.author}, Bu sunucuda büyük harf kullanımı engelleniyor!`);
                                const msg = await message.channel.send({ embeds: [embed] });
                                if (msg) setTimeout(() => msg.delete(), 5000);
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.error('An error occurred:', err);
        }
    }
};
