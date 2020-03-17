module.exports = {
	main: function(bot, msg) {
		const Parser = require('../../parser');

		const guild = bot.getGuild(msg.guild.id);
		const user = bot.getUser(msg);

		const args = [];
		args.push(new Parser.Argument('user', Parser.Types.MEMBER_MENTION, false));
		args.push(new Parser.Argument('reason', Parser.Types.LONG_STRING, true));

		const parser = new Parser.Parser(msg, args);
		const target = bot.getMember(parser.get('user'));

		if (user.admin && !(target.admin || target.mod)) {
			parser.get('user').kick(parser.get('reason'));
			bot.sendNotification('User kicked', 'success', msg);

			bot.saveGuild(msg.guild.id);
		}
		else {
			if (!user.admin) {
				bot.sendNotification('Only admins can ban users');
			}
			else {
				bot.sendNotification('Admins/Mods cannot be banned');
			}
		}
	},
	help: 'Kicks the mentioned user (User data is kept)',
	usage: 'kick [mentioned user]',
	module: __dirname.split(require('path').sep).pop()
};
