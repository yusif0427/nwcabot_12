const Discord = require("discord.js");
const { EmbedBuilder,MessageEmbed } = require("discord.js")
const fs = require("fs");
const db = require('croxydb')
const config = require("./config.json");
const token = process.env.BOT_TOKEN || config.token;

if (!token) {
	console.error('[x] Bot token is not set. Set the BOT_TOKEN environment variable or add it to config.json');
	process.exit(1);
}
const functions = require('./function/functions');
const Rest = require("@discordjs/rest");
const DiscordApi = require("discord-api-types/v10");

const client = new Discord.Client({
	intents: [
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.GuildMembers,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.MessageContent,
		Discord.GatewayIntentBits.GuildMessageReactions,
		Discord.GatewayIntentBits.GuildVoiceStates,
		Discord.GatewayIntentBits.GuildPresences
	],
	partials: Object.values(Discord.Partials),
	allowedMentions: {
		parse: ["users", "roles", "everyone"]
	},
	retryLimit: 3
});

global.client = client;
client.commands = (global.commands = []);
client.commandMap = new Map();

//
console.log(`[-] ${fs.readdirSync("./commands").length} komut algÄ±landÄ±.`)

for(let commandName of fs.readdirSync("./commands")) {
	if(!commandName.endsWith(".js")) return;

	const command = require(`./commands/${commandName}`);	
	client.commandMap.set(command.name.toLowerCase(), command);
	client.commands.push({
		name: command.name.toLowerCase(),
		description: command.description.toLowerCase(),
		options: command.options,
		dm_permission: false,
		type: 1
	});

	console.log(`[+] ${commandName} komutu baÅŸarÄ±yla yÃ¼klendi.`)
}

client.on('messageCreate', msg => { 
	
	if (msg.content === `<@${config["bot-id"]}>`) {
        msg.reply('Birisi Beni Ã‡aÄŸÄ±rdÄ± SanÄ±rÄ±m KomutlarÄ±ma `/yardÄ±m` ile bakabilirsin  ðŸ’•');
    }
	
  });
  client.on('messageCreate', msg => {
    const content = msg.content.toLowerCase(); 

    const replies = {
        'sa': 'as cnm la naber ðŸ˜‹',
        'naber': 'iyi senden naber ðŸ˜ƒ',
        'sea': 'as cnm la naber ðŸ˜‹',
        'selam': 'as cnm la naber ðŸ˜‹',
        'selamun aleykÃ¼m': 'as cnm la naber ðŸ˜‹',
        'selamunaleykÃ¼m': 'as cnm la naber ðŸ˜‹',
        'selamunaleykum': 'as cnm la naber ðŸ˜‹'
    };
		if (replies[content]) {
			msg.reply(replies[content]);
		}
	});
// 

console.log(`[-] ${fs.readdirSync("./events").length} olay algÄ±landÄ±.`)

for(let eventName of fs.readdirSync("./events")) {
	if(!eventName.endsWith(".js")) return;

	const event = require(`./events/${eventName}`);	
	const evenet_name = eventName.split(".")[0];

	client.on(event.name, (...args) => {
		event.run(client, ...args)
	});

	console.log(`[+] ${eventName} olayÄ± baÅŸarÄ±yla yÃ¼klendi.`)
}



client.once("ready", async() => {
	const rest = new Rest.REST({ version: "10" }).setToken(token);
  try {
    await rest.put(DiscordApi.Routes.applicationCommands(client.user.id), {
      body: client.commands,  //
    });
	
	console.log(`${client.user.tag} Aktif! ðŸ’•`);
	db.set("botAcilis_", Date.now());

  } catch (error) {
    throw error;
  }
});

// Basit web sunucusu (statik site)
const http = require('http');
const path = require('path');
const PORT = process.env.PORT || config.webPort || 3000;
const publicDir = path.join(__dirname, 'public');

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (!reqPath || reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(publicDir, reqPath);

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
   res.end(data);
  });
}).listen(PORT, () => {
  console.log(`[+] Web sunucusu ${PORT} portunda dinliyor.`);
});

client.login(token).then(() => {
	console.log(`[-] Discord API'ye istek gÃ¶nderiliyor.`);
	eval("console.clear()");
}).catch(() => {
	console.log(`[x] Discord API'ye istek gÃ¶nderimi baÅŸarÄ±sÄ±z(token girmeyi unutmuÅŸsun).`);
});

