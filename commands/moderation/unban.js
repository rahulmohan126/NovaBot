module.exports = {
	main: async function(bot, msg) {
		const Parser = require('../../parser');

		const guild = bot.getGuild(msg.guild.id);
		const user = bot.getUser(msg);

		const args = [];
		args.push(new Parser.Argument('user', Parser.Types.STRING, false));
		args.push(new Parser.Argument('reason', Parser.Types.LONG_STRING, true));

		const parser = new Parser.Parser(msg, args);

		if (user.admin) {
			const name = parser.get('user');
			let guildBans = await msg.guild.fetchBans()
			let target = guildBans.filter(function(ban) {
				return ban.username === name;
			}).first();

			console.log(msg.guild.members.unban(target, parser.get('reason')));

            bot.sendNotification('User unbanned', 'success', msg);
		}
		else {
			bot.sendNotification('Only admins can unban users', 'error', msg);
		}
	},
	help: 'Unbans the user from username.',
	usage: 'unban [user username]',
	module: __dirname.split(require('path').sep).pop()
};
