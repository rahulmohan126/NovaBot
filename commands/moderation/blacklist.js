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
					guild.channels.blacklisted[parser.get('type')].push(id);
					guild.channels.whitelisted[parser.get('type')] = guild.channels.whitelisted[parser.get('type')].filter(channel => channel !== id);
				}
				bot.sendNotification('Channel blacklisted.', 'success', msg);
			}
			else {
				guild.words.push(...parser.get('words').split(','));
				bot.sendNotification('Word(s) whitelisted.', 'success', msg);
			}

			bot.saveGuild(msg.guild.id);
		}
		else {
			bot.sendNotification('Only admins can blacklist channels/words ', 'error', msg);
		}
	},
	help: 'Blacklists channels and words, disallows the bot from operating in specified channels or disallows specific words from being said by members.',
	usage: 'blacklist [channel | word] [channel mention | all | comma,separated,words]',
	module: __dirname.split(require('path').sep).pop()
};
