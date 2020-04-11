module.exports = {
	main: function(bot, msg) {
		const Parser = require('../../parser');

		const user = bot.getUser(msg);

		const args = [];
		args.push(new Parser.Argument('user', Parser.Types.MEMBER_MENTION, false));
		args.push(new Parser.Argument('time', Parser.Types.NUMBER, true));
		args.push(new Parser.Argument('reason', Parser.Types.LONG_STRING, true));

		const parser = new Parser.Parser(msg, args);
		const target = bot.getMember(parser.get('user'));

		if (user.admin && true) { // !(target.admin || target.mod)
			target.ignored = true;
			bot.sendNotification('User ignored', 'success', msg);
			bot.saveGuild(msg.guild.id);
		}
		else {
			if (!user.admin) {
				bot.sendNotification('Only admins can ignore users', 'error', msg);
			}
			else {
				bot.sendNotification('Admins/Mods cannot be ignored', 'error', msg);
			}
		}
	},
	help: 'The bot "ignores" all commands from targeted user',
	usage: 'ignore [mentioned user]',
	module: __dirname.split(require('path').sep).pop()
};
