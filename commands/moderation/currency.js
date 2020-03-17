module.exports = {
	main: function(bot, msg) {

		const arg = msg.content.split(' ')[0].trim();
		
		if (arg === '') {
			bot.sendNotification(`The current currency is: ${bot.getGuild(msg.guild.id).economy.currency}`, 'info', msg);
		}
		else if (msg.author.id === msg.guild.ownerID) {
			bot.getGuild(msg.guild.id).economy.currency = arg;
			bot.saveGuild(msg.guild.id);
			bot.sendNotification(`The new prefix is ${arg}.`, 'success', msg);
		}
		else {
			bot.sendNotification('Only the guild owner can change the currency.', 'error', msg);
		}
	},
	help: 'See/set the currency for the server.',
	usage: 'currency (new currency)'
};
