module.exports = {
	main: function(bot, msg) {
		const guild = bot.getGuild(msg.guild.id);
		const user = bot.getUser(msg);

		if (user.admin) {
			let words = msg.content.split(',');
			guild.words = guild.words.filter(x => !words.includes(x));
			bot.sendNotification('Word(s) whitelisted.', 'success', msg);

			bot.saveGuild(msg.guild.id);
		}
		else {
			bot.sendNotification('Only admins can whitelist words ', 'error', msg);
		}
	},
	help: 'Whitelists words, allows specific words to be said by members.',
	usage: 'whitelist [comma,separated,words]',
	module: __dirname.split(require('path').sep).pop()
};
