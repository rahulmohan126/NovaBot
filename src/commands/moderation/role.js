module.exports = {
	main: function (bot, msg) {
		const Parser = require('../../parser');

		const guild = bot.getGuild(msg.guild.id);
		const user = bot.getUser(msg);

		const args = [];
		args.push(new Parser.Argument('type', Parser.Types.STRING, false, ['admin', 'mod']));
		args.push(new Parser.Argument('role', Parser.Types.ROLE_MENTION, true));

		const parser = new Parser.Parser(msg, args);

		if (parser.isUsed('role') && msg.author.id !== msg.guild.ownerID) {
			bot.sendNotification('Only the guild owner can set admin/mod roles', 'error', msg);
			return;
		}

		try {
			var type = parser.get('type');
			var role;

			console.log(type);
			console.log(guild[type]);

			if (guild[type] !== 0) {
				role = msg.guild.roles.cache.get(guild[type]);

				let oldRoles = role.members.array();

				for (let id in oldRoles) {
					bot.getMember(oldRoles[id])[type] = false;
				}
			}

			role = parser.get('role');
			guild[type] = role.id;

			let newRoles = role.members.array();

			for (let id in newRoles) {
				bot.getMember(newRoles[id])[type] = true;
			}
		}
		catch {
			bot.sendNotification('Args error: Check arguements and try again.', 'error', msg);
		}

		bot.saveGuild(msg.guild.id);
	},
	help: '',
	usage: '',
	module: __dirname.split(require('path').sep).pop()
};
