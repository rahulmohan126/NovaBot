module.exports = {
	main: function(bot, msg) {
		const Parser = require('../../parser');
		
		const guild = bot.getGuild(msg.guild.id);
		const user = bot.getUser(msg);

		const args = [];
		args.push(new Parser.Argument('command', Parser.Types.STRING, false, ['payout', 'fine', 'start']));

		args.push(new Parser.Argument('action', Parser.Types.STRING, false, ['work', 'crime'], [new Parser.Parent(args[0], 'payout')]));
		args.push(new Parser.Argument('payoutType', Parser.Types.STRING, false, ['min', 'max'], [new Parser.Parent(args[0], 'payout')]));
		args.push(new Parser.Argument('payoutValue', Parser.Types.NUMBER, true, [], [new Parser.Parent(args[0], 'payout')]));

		args.push(new Parser.Argument('fineType', Parser.Types.STRING, false, ['min', 'max'], [new Parser.Parent(args[0], 'fine')]));
		args.push(new Parser.Argument('fineValue', Parser.Types.NUMBER, true, [], [new Parser.Parent(args[0], 'fine')]));

		args.push(new Parser.Argument('startValue', Parser.Types.NUMBER, true, [], [new Parser.Parent(args[0], 'start')]))


		const parser = new Parser.Parser(msg, args);
		const command = parser.get('command');

		const guildCurrency = guild.economy.currency;

		if ((parser.isUsed('payoutValue') || parser.isUsed('payoutValue') || parser.isUsed('payoutValue')) && msg.author.id !== msg.guild.ownerID) {
			bot.sendNotification('Only the guild owner can make economy changes', 'error', msg);
			return;
		}

		if (command === 'payout') {
			if (parser.isUsed('payoutValue')) {
				guild.economy[parser.get('action')][['min', 'max'].indexOf(parser.get('payoutType'))] = parser.get('payoutValue');
				bot.sendNotification(`Server ${parser.get('payoutType')} ${parser.get('action')} payout is now: ${guildCurrency}${parser.get('payoutValue')}`, 'info', msg);
				bot.saveGuild(msg.guild.id);
			}
			else {
				bot.sendNotification(`Server ${parser.get('payoutType')} ${parser.get('action')} payout is: ${guildCurrency}${guild['economy'][parser.get('action')][['min', 'max'].indexOf(parser.get('payoutType'))]}`, 'info', msg);
			}
		}
		else if (command === 'fine') {
			if (parser.isUsed('fineValue')) {
				guild['economy']['crime'][['min', 'max'].indexOf(parser.get('fineType')) + 2] = parser.get('fineValue');
				bot.sendNotification(`Server ${parser.get('fineType')} crime fine is now: ${guildCurrency}${parser.get('fineValue')}`, 'info', msg);
				bot.saveGuild(msg.guild.id);
			}
			else {
				bot.sendNotification(`Server ${parser.get('fineType')} crime fine is: ${guildCurrency}${guild['economy']['crime'][['min', 'max'].indexOf(parser.get('fineType')) + 2]}`, 'info', msg);
			}
		}
		else {
			if (parser.isUsed('startValue')) {
				guild['economy']['start'] = parser.get('startValue');
				bot.sendNotification(`Server starting balance is now: ${guildCurrency}${parser.get('startValue')}`, 'info', msg);
				bot.saveGuild(msg.guild.id);
			}
			else {
				bot.sendNotification(`Server starting balance is: ${guildCurrency}${guild['economy']['start']}`, 'info', msg);
			}
		}
	},
	help: '',
	usage: '',
	module: __dirname.split(require('path').sep).pop()
};
