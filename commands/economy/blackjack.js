module.exports = {
	main: async function(bot, msg) {		
		class Card {
			constructor(suite, rank) {
				this.suite = suite
				this.rank = rank
				this.value = rank > 10 ? 10 : rank;
				this.isAce = rank === 1 ? true : false;
				this.fmt;

				if (this.rank == 1) this.fmt = 'A';
				else if (this.rank == 11) this.fmt = 'J';
				else if (this.rank == 12) this.fmt = 'Q';
				else if (this.rank == 13) this.fmt = 'K';
				else this.fmt = String(rank);

				this.fmt += ['♠', '♣', '♥', '♦'][this.suite - 1];
			}
		}

		class Game {
			constructor(numDecks) {
				this.deck = []
				for (let i = 0; i < numDecks; i++) this.deck.push(...this.newDeck())

				this.player = []
				this.playerValue = 0
				
				this.dealer = []
				this.dealerValue = 0

				this.playerSoft = false;
				this.dealerSoft = false;
			}

			newDeck() {
				var deck = [];
				
				for (let s = 0; s < 4; s++) {
					for (let r = 0; r < 13; r++) {
						deck.push(new Card(s + 1, r + 1));
					}
				}

				return(deck);
			}

			drawCard(type) {
				let index = Math.floor(Math.random() * this.deck.length);
				if (type == 0) {
					this.player.push(this.deck.splice(index, 1)[0]);
				}
				else {
					this.dealer.push(this.deck.splice(index, 1)[0]);
				}
			}

			calc() {
				let aces = 0;
				this.playerValue = this.player.reduce((acc,card) => {
					if (card.isAce) aces++;
					return(acc + card.value);
				}, 0);

				this.playerSoft = false;
				while (aces > 0 && this.playerValue < 11) {
					this.playerValue += 10;
					aces--;
					this.playerSoft = true;
				}

				aces = 0;
				this.dealerValue = this.dealer.reduce((acc,card) => {
					if (card.isAce) aces++;
					return(acc + card.value);
				}, 0);

				this.dealerSoft = false;
				while (aces > 0 && this.dealerValue < 11) {
					this.dealerValue += 10;
					aces--;
					this.dealerSoft = true;
				}			
			}

			displayGame(msg, isStand) {
			// 1=win   2=bust   3=Dwin   4=Dbust   5=Tie
				this.calc();
	
				var result = 0
				if (this.playerValue == 21) result = 1;
				else if (this.playerValue > 21) result = 2;
				else if (this.dealerValue == 21) result = 3;
				else if (this.dealerValue > 21) result = 4;
				else if (this.dealerValue > this.playerValue && isStand) result = 3;
				else if (this.playerValue == this.dealerValue && isStand) result = 5;
				
				var resultStr;
	
				switch (result) {
					case 1:
						resultStr = 'You win!';
						break;
					case 2:
						resultStr = 'You bust!';
						break;
					case 3:
						resultStr = 'Dealer wins!';
						break;
					case 4:
						resultStr = 'Dealer bust!';
						break;
					case 5:
						resultStr = 'Tie, Push Back!';
						break;
					default:
						resultStr = '-----------------------------------';
						break;
				}
	
				var embed = {
					color: bot.INFO_COLOR,
					description: resultStr,
					timestamp: Date(Date.now()),
					author: {
						name: msg.author.tag,
						icon_url: msg.author.avatarURL
					},
					fields: [
						{
							name: "Your Hand",
							value: `${this.player.reduce((arr, c) => {arr.push(c.fmt); return arr}, []).join(' ')}\nValue: ${this.playerSoft ? 'Soft' : ''} ${this.playerValue}`
						},
						{
							name: "Dealer Hand",
							value: `${this.dealer.reduce((arr, c) => {arr.push(c.fmt); return arr}, []).join(' ')}\nValue: ${this.dealerSoft ? 'Soft' : ''} ${this.dealerValue}`
						}
					]
				}
	
				msg.channel.send('', {embed});
	
				return(result)
			}
		}

		getInput = async function(msg) {
			try {
				var response = await msg.channel.awaitMessages(msg2 => ((msg2.content == 'stand') || (msg2.content == 'hit')) && msg2.author.id == msg.author.id, {
					maxMatches: 1,
					time: 10000,
					errors: ['time']
				});
				return(response = response.first().content);
			} catch (err) {
				console.error(err);
				return msg.channel.send('No move selected, game over.');
			}
		}

		const user = bot.getUser(msg);
		
		const bet = parseInt(msg.content);
		if (isNaN(bet) || bet > user.cash) {
			msg.channel.send('That is not a valid amount.');
			return;
		}

		user.cash -= bet;
		user.netWorth -= bet;

		// Stars a game with 1 deck of cards.
		const game = new Game(1);

		var winType;
		var winAmount = 0;

		for (i = 0; i < 2; i++) {
			game.drawCard(0);
			game.drawCard(1);
		}

		winType = game.displayGame(msg, false);

		if (winType == 1) winAmount = Math.floor(2.5 * bet);
		else if (winType == 4) winAmount = (2 * bet);
		else if (winType == 5) winAmount = bet;
		else {
			response = await getInput(msg);
				
			while (response === 'hit') {

				game.drawCard(0);
				game.calc();
				winType = game.displayGame(msg, false);
				if (winType != 0) break;

				response = await getInput(msg);
			}

			if (response === 'stand') {
				while (game.dealerValue < game.playerValue) {
					game.drawCard(1);
					game.calc();
				}
				winType = game.displayGame(msg, true);
			}

			if (winType == 1 || winType == 4) {
				winAmount = (2 * bet);
			}
			else if (winType == 5) {
				winAmount = bet;
			}
		}

		user.cash += winAmount;
		user.netWorth += winAmount;

		bot.saveGuild(msg.guild.id);
	},
	help: 'Play a game of blackjack and win some money (maybe)',
	usage: 'blackjack [amount]',
	module: __dirname.split(require('path').sep).pop()
};
