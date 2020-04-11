module.exports = {
	main: function(bot, msg) {
		const guild = bot.getGuild(msg.guild.id);
		const user = bot.getUser(msg);

		if (user.admin) {
			let words = msg.content.split(',');
			guild.words.push(...words);
			bot.sendNotification('Word(s) whitelisted.', 'success', msg);

			bot.saveGuild(msg.guild.id);
		}
		else {
			bot.sendNotification('Only admins can blacklist channels/words ', 'error', msg);
		}
	},
	help: 'Blacklist words, disallows specific words to be said by members.',
	usage: 'blacklist [comma,separated,words]',
	module: __dirname.split(require('path').sep).pop()
};
