'use strict';
const startTime = Date.now();
//#region  ---------------------	Packages	---------------------
const Discord = require('discord.js');
const YouTube = require('simple-youtube-api');
const fs = require('fs');
const ytdl = require('ytdl-core');
const readline = require('readline');
const bot = new Discord.Client({autoReconnect: true});
//#endregion
//#region  ---------------------	  Bot		---------------------

// Required
const config = JSON.parse(fs.readFileSync(__dirname+'/settings.json'));
bot.ID = config.BOTID;
bot.OWNERID = config.OWNERID;
bot.PREFIX = config.PREFIX;
bot.TOKEN = config.TOKEN;
bot.GOOGLE_API_KEY = config.GOOGLE_API_KEY;

// Colors
bot.COLOR = 0x351C75;
bot.SUCCESS_COLOR = 0x66bb69;
bot.ERROR_COLOR = 0xEF5250;
bot.INFO_COLOR = 0x03A8F4;

// Other
const youtube = new YouTube(bot.GOOGLE_API_KEY);
bot.start = startTime;
bot.db = new Map();
bot.queue = new Map();
bot.DETAILED_LOGGING = true;

// Functions
//#region ---------	  Formatting	---------
bot.sendNotification = function(info, code, msg, fields=[]) {
	var color;

	switch (code) {
		case 'success':
			color = bot.SUCCESS_COLOR;
			break;
		case 'error':
			color = bot.ERROR_COLOR;
			break;
		case 'info':
			color = bot.INFO_COLOR;
			break;
		default:
			color = bot.COLOR;
			break;
	}

	let embed = {
		color: color,
		description: info,
		timestamp: Date(Date.now()),
		fields: fields,
		author: {
			name: msg.author.tag,
			icon_url: msg.author.avatarURL
		}
	};

	msg.channel.send('', {embed});
};

bot.comma = function(x) {
	return(x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
};
//#endregion

//#region ---------		Music		---------
// YouTube duration (string) to seconds (number)
bot.durationSeconds = function(duration) {
	const letter = ['S', 'M', 'H'];
	const value = [1, 60, 3600];
	const durationComponents = duration.slice(2).split(/(.+?[A-Z])/g);

	var time = 0;

	durationComponents.forEach(element => {
		if (element != '') {
			time += parseInt(element.slice(0, element.length - 1)) * value[letter.indexOf(element[element.length - 1])];
		}
	});

	return(time);
};

// Returns formatted duration
bot.timeToString = function(duration) {
	if (typeof duration === 'string') {
		let durationComponents = duration.slice(2, duration.length).toLowerCase().split(/(.+?[a-z])/g).filter(x => x != '');

		while (durationComponents.length < 3) durationComponents.unshift('0');

		for (var i = 0; i < durationComponents.length; i++) {
			durationComponents[i] = durationComponents[i].slice(0, durationComponents[i].length - 1)
			
			durationComponents[i] = '0'.repeat(2 - durationComponents[i].length) + durationComponents[i];
		}

		return(durationComponents.join(':'));
	}
	else {
		var timeArray = [];

		while (timeArray.length < 3) {
			timeArray.unshift(String(duration % 60));
			duration = Math.floor(duration / 60);
		}

		for (let i = 0; i < timeArray.length; i++) {
			timeArray[i] = '0'.repeat(2 - timeArray[i].length) + timeArray[i];
		}

		return(timeArray.join(':'));
	}
};

// Time until next song
bot.timeToSong = function(serverMap) {
	let totalTime = 0;
	for (let i = 0; i < serverMap.songs.length - 1; i++) {
		totalTime += bot.durationSeconds(serverMap.songs[i].duration);
	}
	totalTime -= Math.floor((Date.now() - serverMap.songs[0].start) / 1000);
	return bot.timeToString(totalTime);
};

// Handles video requests from play command
bot.handleVideo = async function(video, msg, voiceChannel, playlist = false) {
	const serverQueue = bot.queue.get(msg.guild.id);
	video = await youtube.getVideoByID(video.id);
	const song = {
		id: video.id,
		title: Discord.Util.escapeMarkdown(video.title),
		url: `https://www.youtube.com/watch?v=${video.id}`,
		thumbnail: video.thumbnails.default.url,
		duration: video.raw.contentDetails.duration,
		start: 0,
		user: msg.author
	};

	let x = bot.durationSeconds(song.duration);

	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		};
		bot.queue.set(msg.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			queueConstruct.songs[0] = bot.play(msg.guild, queueConstruct.songs[0]);
		} catch (error) {
			return;
		}
	} else {
		serverQueue.songs.push(song);
		if (playlist) return undefined;
		else return msg.channel.send(`✅ **${song.title}** has been added to the queue! It will begin playing in ${bot.timeToSong(serverQueue)}`);
	}
	return undefined;
};

// Plays stream of first video in server map
bot.play = function(guild, song) {
	const serverQueue = bot.queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		bot.queue.delete(guild.id);
		return;
	}


	const dispatcher = serverQueue.connection.play(ytdl(song.url))
		.on('finish', reason => {
			if (reason === 'Stream is not generating quickly enough.') {
				serverQueue.textChannel.send('Sorry, slow network connection...');
			}
			if (bot.DETAILED_LOGGING) console.error(`Guild: ${serverQueue.textChannel.guild.name} (${serverQueue.textChannel.guild.id}) | Audio Disconnection: ${reason}`);

			serverQueue.songs.shift();
			song = bot.play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

	bot.sendNotification(`🎶 Start playing: **${song.title}**`, 'success', {'channel' : serverQueue.textChannel, 'author': song.user});

	song.start = Date.now();
	return song;
};

//#endregion

//#region ---------	   Database		---------
// Gets a guild object from database
bot.getGuild = function (guildID) {
	// In case bot guild has been deleted or not created yet
	if (!bot.db.get(guildID)) {
		bot.db.set(guildID, {
			prefix: '.',
			admin: 0,
			mod: 0,
			economy: {
				currency: '$',
				start: 1000,
				//		Payout
				work: [100, 200],
				//		  Payout	Fine
				crime: [100, 200, 500, 800]
			},
			channels: {
				whitelisted: {
					text: [],
					voice: []
				},
				blacklisted:  {
					text: [],
					voice: []
				}
			},
			words: [],
			users : {}
		});

		bot.saveGuild(guildID);
	}

	return(bot.db.get(guildID));
};

// Gets user object from guild object
bot.getUser = function (msg) {
	// In case bot guild has been deleted or not created yet
	const guild = bot.getGuild(msg.guild.id);
	
	if (!guild.users[msg.author.id]) {
		let isAdmin = false, isMod = false;
		if (guild.admin != 0 && msg.member.roles.has(guild.admin)) {
			isAdmin = true;
			isMod = true;
		}

		if (guild.mod != 0 && msg.member.roles.has(guild.mod)) {
			isMod = true;
		}
		
		guild.users[msg.author.id] = {
			admin: isAdmin,
			mod: isMod,
			ignored: false,
			cash: guild.economy.start,
			bank: 0,
			assets: {
				items: [],
				value: 0
			},
			netWorth: guild.economy.start
		}

		bot.saveGuild(msg.guild.id);
	}

	return(guild.users[msg.author.id]);
};

bot.getMember = function (member) {
	const guild = bot.getGuild(member.guild.id);

	if (!guild.users[member.user.id]) {
		let isAdmin = false, isMod = false;
		if (guild.admin != 0 && member.roles.cache.has(guild.admin)) {
			isAdmin = true;
		}

		if (guild.mod != 0 && member.roles.has(guild.mod)) {
			isMod = true;
		}
		
		guild.users[member.user.id] = {
			admin: isAdmin,
			mod: isMod,
			ignored: false,
			cash: guild.economy.start,
			bank: 0,
			assets: {
				items: [],
				value: 0
			},
			netWorth: guild.economy.start
		}

		bot.saveGuild(member.guild.id);
	}

	return(guild.users[member.user.id]);
};

// Saves guild object to file
bot.saveGuild = function(guildID) {
	fs.writeFileSync(`${__dirname}/database/${guildID}.json`, JSON.stringify(bot.db.get(guildID), null, 4));
};
//#endregion

//#endregion
//#region  ---------------------	Commands	---------------------

var commands = {};

// BASE COMMANDS (cannot be reloaded)

commands.help = {};
commands.help.args = '';
commands.help.help = '';
commands.help.hide = true;
commands.help.main = function(bot, msg) {

	if (msg.content === '') {
		var cmds = [];

		for (let command in commands) {
			if (!commands[command].hide) {
				cmds.push(command);
			}
		}

		cmds = cmds.join(', ');

		bot.sendNotification(`Bot prefix: ${bot.getGuild(msg.guild.id).prefix}`, 'info', msg, [
			{
			name: 'Commands: ',
			value: cmds,
			inline: true
			}
		]);
	}
	else {
		let command = msg.content;

		if (commands[command]) {

			bot.sendNotification(`Bot prefix: ${bot.getGuild(msg.guild.id).prefix} | Command: ${command}`, 'info', msg, [
				{
					name: 'Description: ',
					value: commands[command].help,
				},
				{
					name: 'Usage: ',
					value: commands[command].usage,
				}
			]);
		}
		else {
			bot.sendNotification('That command does not exist', 'error', msg);
		}
	}
};

commands.reload = {};
commands.reload.args = '';
commands.reload.help = '';
commands.reload.hide = true;
commands.reload.main = function(bot, msg) {
	let command = msg.content.split(' ')[0];

	if (msg.author.id === bot.OWNERID){
		try {
			if (commands[command]) {
				var directory = `${__dirname}/commands/${commands[command].module}/${command}.js`;
				delete commands[command];
				delete require.cache[require.resolve(directory)];
				commands[command] = require(directory);
				bot.sendNotification(`Reloaded ${command} command successfully.`, 'success', msg);

				if (bot.DETAILED_LOGGING) console.log(`Command: "${command}" | Status: Reloaded`);
			}
		}
		catch(err){
			console.log(err);
			bot.sendNotification('Command not found', 'error', msg);
		}
	}
	else {
		bot.sendNotification('You do not have permission to use this command.', 'error', msg);
	}
};

//#endregion
//#region  ---------------------	Functions   ---------------------

var consoleListener = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});

// Checks if text channel is permitted to use bot commands in.
var validMsg = function(msg, guild) {
	if (bot.getUser(msg).ignored) return(false);

	// Put in try-catch in case no mentions are in the message.
	try {
		if (!(msg.content.trim().startsWith(guild.prefix) || msg.mentions.members.first().id === bot.ID)) return(false);
	}
	catch {
		return(false);
	}

	let [whitelisted, blacklisted] = [guild.channels.whitelisted, guild.channels.blacklisted];

	if (msg.author.id === 0 || whitelisted.text.includes(msg.channel.id)) {
		// Pass, guild owner can send commands in any channel.
	}
	// Specific channels will always take priority over "all". (ie If all text channels are blacklisted
	// but one specifc channel is whitelisted, it will be considered as whitelisted)
	else if (blacklisted.text.includes(msg.channel.id) || blacklisted.text.includes('all')) {
		return(false);
	}
	
	return(true);
};

// Loads commands in from ./commands folder
var loadCommands = function() {
	var modules = fs.readdirSync(__dirname+'/commands/');

	for (let module of modules) {
		var files = fs.readdirSync(__dirname+'/commands/'+module);
		for (let file of files) {
			if (file.endsWith('.js')) {
				commands[file.slice(0, -3)] = require(__dirname+'/commands/'+module+'/'+file);
				if (bot.DETAILED_LOGGING) console.log(`Command: ${file.slice(0, -3)} | Status: Loaded`);
			}
		}
	}

	console.log('———— All Commands Loaded! ————');
};

// Loads guilds in from database
var loadGuilds = function() {
	var files = fs.readdirSync(`${__dirname}/database/`);

	for (let file of files) {
		if (file.endsWith('.json')) {
			bot.db.set(file.slice(0, -5), JSON.parse(fs.readFileSync(`${__dirname}/database/${file}`)));
			if (bot.DETAILED_LOGGING) console.log(`Guild: ${file.slice(0, -5)} | Status: Loaded`);
		}
	}

	console.log('———— All Guilds Loaded! ————');
};

//#endregion
//#region  ---------------------	Handlers	---------------------
bot.on('ready', () => {
	bot.user.setActivity(`over ${bot.guilds.cache.array().length} servers...`, { type: 'WATCHING' });
	
	loadCommands();
	loadGuilds();
	
	const startUpTime = Date.now() - startTime;
	console.log(`Ready to begin! Serving in ${bot.guilds.cache.array().length} servers. Startup time: ${startUpTime}ms`);
});

bot.on('message', msg => {
	const guild = bot.getGuild(msg.guild.id);
	const guildPrefix = guild.prefix;

	if (msg.author.id != bot.ID && validMsg(msg, guild)) {
		var command;
		if (msg.content.startsWith(guildPrefix)) {
			command = msg.content.split(' ')[0].slice(guildPrefix.length);
			// Removes prefix and command from beginning of the message
			msg.content = msg.content.slice(guildPrefix.length + command.length).trimLeft();
		}
		// If it is a valid message and doesn't start with the guild prefix, then it must mention the bot.
		else {
			command = msg.content.split(' ')[1];
			// Removes mention and command from beginning of the message
			msg.content = msg.content.splice(3 + String(bot.ID).length + 1 + 1 + command.length).trimLeft();
		}
		

		if (bot.DETAILED_LOGGING) console.log(`Guild: ${msg.guild.name} (${msg.guild.id}) | Author: ${msg.member.displayName} (${msg.author.id}) | Message: ${guildPrefix}${command} ${msg.content}`);

		if (commands[command]) {
			if (command === 'play') {
				commands[command].main(bot, msg, youtube);
			}
			else {
				commands[command].main(bot, msg);
			}
		}
	}
});

bot.on('error', (err) => {
	console.error('—————————— ERROR ——————————');
	console.error(err);
	console.error('———————— END ERROR ————————');
});

bot.on('disconnected', () => {
	console.error('——————— DISCONNECTED ——————');
});

bot.on('guildCreate', guild => {
	bot.user.setActivity(`over ${bot.guilds.cache.array().length} servers...`, { type: 'WATCHING' });
	bot.getGuild(guild.id); // Initializes a new guild
    if (bot.DETAILED_LOGGING) console.log(`New guild: ${guild.name}`);
});

bot.on('guildMemberUpdate', (oldMember, newMember) => {
	console.log('bruh');
	const {admin, mod} = bot.getGuild(oldMember.guild.id);
	const user = bot.getMember(oldMember);
	if (admin !== 0) {
		if (newMember.roles.cache.has(admin)) {
			user.admin = true;
		}
		else {
			user.admin = false;
		}
	}

	if (mod !== 0) {
		if (newMember.roles.cache.has(mod)) {
			user.admin = true;
		}
		else {
			user.admin = false;
		}
	}
	bot.saveGuild(oldMember.guild.id);
});

bot.login(bot.TOKEN);

consoleListener.on('line', function (input) {
	if (input.includes('stop')) {
		bot.destroy();
		process.exit(0);
	}
});

//#endregion