module.exports = {
	main: function(bot, msg) {
		const economy = bot.getGuild(msg.guild.id).economy;
		const user = bot.getUser(msg);

		const amount = Math.round(Math.random() * (economy.work[1] - economy.work[0])) + economy.work[0];

		user.cash += amount;
		user.netWorth += amount;

		bot.sendNotification(`You made ${economy.currency}${amount} by working.`, 'success', msg);
		bot.saveGuild(msg.guild.id);
	},
	help: 'Work to earn some money and increase your cash balance.',
	usage: 'work',
	module: __dirname.split(require('path').sep).pop()
};
