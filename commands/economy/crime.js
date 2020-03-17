module.exports = {
	main: function(bot, msg) {
		const economy = bot.getGuild(msg.guild.id).economy;
		const user = bot.getUser(msg);
		var amount;
		
		if (Math.random() < 0.55) { // 55% success rate
			amount = Math.round(Math.random() * (economy.crime[1] - economy.crime[0])) + economy.crime[0];
			bot.sendNotification(`You successfully committed a crime and earned ${economy.currency}${amount}.`, 'success', msg);
		}
		else {
			amount = -1 * (Math.round(Math.random() * (economy.crime[3] - economy.crime[2])) + economy.crime[2]);
			bot.sendNotification(`You were caught committing a crime and was fined ${economy.currency}${Math.abs(amount)}.`, 'error', msg);
		}

		user.cash += amount;
		user.netWorth += amount;

		bot.saveGuild(msg.guild.id);
	},
	help: 'Commit a crime to make some money, but beware the risk!',
	usage: 'crime',
	module: __dirname.split(require('path').sep).pop()
};
