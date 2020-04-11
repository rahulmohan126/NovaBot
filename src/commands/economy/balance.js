module.exports = {
	main: function(bot, msg) {
		const currency = bot.getGuild(msg.guild.id).economy.currency;
		const user = bot.getUser(msg);

		bot.sendNotification('', 'info', msg, [
			{
			name: `Cash:`,
			value: `${currency}${bot.comma(user.cash)}`,
			inline: true
			},
			{
			name: `Bank:`,
			value: `${currency}${bot.comma(user.bank)}`,
			inline: true
			},
			{
			name: `Net Worth:`,
			value: `${currency}${bot.comma(user.netWorth)}`,
			inline: true
			}
		]);
	},
	help: 'Check your current cash level, bank balance, and net worth.',
	usage: 'balance',
	module: __dirname.split(require('path').sep).pop()
};
