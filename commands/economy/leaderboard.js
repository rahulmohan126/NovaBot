module.exports = {
	main: async function(bot, msg) {
		const guild = bot.getGuild(msg.guild.id);
		const user = bot.getUser(msg);
		const sortedUsers = Object.keys(guild.users).map(function(id) {
			return [id, guild.users[id].netWorth];
		}).sort((a, b) => b[1] - a[1]);

		let msgDescription = '';
		let userIndex = -1;
		
		for (var i = 0; i < sortedUsers.length; i++) {
			if (sortedUsers[i][0] === msg.author.id) {
				userIndex = i;
				break;
			}
		}
		
		let userInBoard = false;

		for (var i = 0; i < 5 && i < sortedUsers.length; i++) {
			if (userIndex === i) userInBoard = true;

			let userID, netWorth;
			[userID, netWorth] = sortedUsers[i];

			let x = await msg.guild.fetchMember(await bot.fetchUser(userID));
			msgDescription += `${i + 1}. ${x.displayName}: ${guild.economy.currency}${netWorth}\n`;
		}

		if (!userInBoard) {
			msgDescription += `...\n${userIndex + 1}. ${user.displayName}: ${guild.economy.currency}${sortedUsers[i][1]}\n`;
		}

		bot.sendNotification(msgDescription, 'info', msg);
	},
	help: 'Lists all the top net worths in the server',
	usage: 'leaderboard',
	module: __dirname.split(require('path').sep).pop()
};