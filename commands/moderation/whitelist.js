module.exports = {
	main: function(bot, msg) {
		const Parser = require('../../parser');

		const guild = bot.getGuild(msg.guild.id);
		const user = bot.getUser(msg);

		const args = [];

		args.push(new Parser.Argument('action', Parser.Types.STRING, false, ['channel', 'word']));
		args.push(new Parser.Argument('words', Parser.Types.LONG_STRING, false, [], [new Parser.Parent(args[0], 'word')]));
		args.push(new Parser.Argument('type', Parser.Types.STRING, false, ['text', 'voice'], [new Parser.Parent(args[0], 'channel')]));
		args.push(new Parser.Argument('channel', Parser.Types.CHANNEL_MENTION, false, [], [new Parser.Parent(args[0], 'channel')]));

		const parser = new Parser.Parser(msg, args);

		if (user.admin) {
			if (parser.get('action') === 'channel') {
				let id = parser.get('channel') === 'all' ? 'all' : parser.get('channel').id;
				if (!guild.channels.whitelisted[parser.get('type')].includes(id)) {
					guild.channels.whitelisted[parser.get('type')].push(id);
					guild.channels.blacklisted[parser.get('type')] = guild.channels.blacklisted[parser.get('type')].filter(channel => channel !== id);
				}
				bot.sendNotification('Channel whitelisted.', 'success', msg);
			}
			else {
				let words = parser.get('words').split(',');
				guild.words = guild.words.filter(x => !words.includes(x));
				bot.sendNotification('Word(s) whitelisted.', 'success', msg);
			}

			bot.saveGuild(msg.guild.id);
		}
		else {
			bot.sendNotification('Only admins can whitelist channels/words ', 'error', msg);
		}
	},
	help: 'Whitelists channels and words, allows the bot to operating in specified channels or allows specific words to be said by members.',
	usage: 'whitelist [channel | word] [channel mention | all | comma,separated,words]',
	module: __dirname.split(require('path').sep).pop()
};
