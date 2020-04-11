module.exports = {
	main: function(bot, msg) {
		const currency = bot.getGuild(msg.guild.id).economy.currency;
		const user = bot.getUser(msg);
		const amount = msg.content === 'all' ? user.bank : parseInt(msg);

		if (amount <= user.bank && amount > 0) {
			user.bank -= amount;
			user.cash += amount;
			bot.sendNotification(`Successfully withdrew ${currency}${amount}`, 'success', msg);
			bot.saveGuild(msg.guild.id);
		}
		else {
			bot.sendNotification('Please enter a valid amount (that does not exceed your current bank balance and is greater than 0).', 'error', msg);
		}
		
	},
	help: 'Withdraws money from your bank account into your cash.',
	usage: 'withdraw [amount]',
	module: __dirname.split(require('path').sep).pop()
};
