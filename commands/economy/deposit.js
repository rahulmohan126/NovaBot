module.exports = {
	main: function(bot, msg) {
		const currency = bot.getGuild(msg.guild.id).economy.currency;
		const user = bot.getUser(msg);
		const amount = msg.content === 'all' ? user.cash : parseInt(msg);

		if (amount <= user.cash) {
			user.cash -= amount;
			user.bank += amount;
			bot.sendNotification(`Successfully deposited ${currency}${amount}`, 'success', msg);
			bot.saveGuild(msg.guild.id);
		}
		else {
			bot.sendNotification('Please enter a valid amount (that does not exceed your current cash balance).', 'error', msg);
		}
		
	},
	help: 'Deposits money from your cash into your bank account.',
	usage: 'deposit [amount]',
	module: __dirname.split(require('path').sep).pop()
};
