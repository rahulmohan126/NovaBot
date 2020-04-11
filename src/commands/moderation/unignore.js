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

		if (user.admin && !(target.admin || target.mod)) {
			target.ignored = false;
			bot.sendNotification('User unignored', 'success', msg);
			bot.saveGuild(msg.guild.id);
		}
		else {
			bot.sendNotification('Only admins can unignored users', 'error', msg);
		}
	},
	help: 'Undos the action of the "ignore" command. Targetted user is once again able to use bot commands.',
	usage: 'unignore [mentioned user]',
	module: __dirname.split(require('path').sep).pop()
};
