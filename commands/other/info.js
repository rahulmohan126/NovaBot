module.exports = {
	main: function(bot, msg) {
		let description = `[Add the bot to your server](https://discordapp.com/api/oauth2/authorize?client_id=${bot.ID}&permissions=2146958807&scope=bot)
	[Source Link](https://github.com/rahulmohan126)`
		bot.sendNotification(description, 'info', msg);
	},
	help: 'Tells you a little bit about the bot!',
	usage: 'info',
	module: __dirname.split(require('path').sep).pop()
};