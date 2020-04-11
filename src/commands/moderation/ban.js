module.exports = {
	main: function(bot, msg) {
		const Parser = require('../../parser');

		const guild = bot.getGuild(msg.guild.id);
		const user = bot.getUser(msg);

		const args = [];
		args.push(new Parser.Argument('user', Parser.Types.MEMBER_MENTION, false));
		args.push(new Parser.Argument('time', Parser.Types.NUMBER, true));
		args.push(new Parser.Argument('reason', Parser.Types.LONG_STRING, true));

		const parser = new Parser.Parser(msg, args);
		const target = bot.getMember(parser.get('user'));

		if (user.admin && !(target.admin || target.mod)) {
			parser.get('user').ban({ days: parser.get('time'), reason: parser.get('reason')});
			bot.sendNotification('User banned', 'success', msg);

			delete guild.users[parser.get('user').id];
			bot.saveGuild(msg.guild.id);
		}
		else {
			if (!user.admin) {
				bot.sendNotification('Only admins can ban users', 'error', msg);
			}
			else {
				bot.sendNotification('Admins/Mods cannot be banned', 'error', msg);
			}
		}
	},
	help: 'Bans the mentioned user (Deletes user data as well)',
	usage: 'ban [mentioned user]',
	module: __dirname.split(require('path').sep).pop()
};