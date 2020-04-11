'use strict';

const Types = {
	// 0, 4
	NUMBER: {
		name: 'number',
		convert: (raw, msg) => Number(raw),
		default: 0
	},
	// 
	STRING: {
		name: 'string',
		convert: (raw, msg) => String(raw),
		default: ''
	},
	LONG_STRING: {
		name: 'long string',
		convert: (raw, msg) => String(raw),
		default: ''
	},
	// <@!ID>
	MEMBER_MENTION: {
		name: 'user mention',
		convert: function(raw, msg) {
			if (raw.startsWith('<@!') && raw.endsWith('>')) {
				return(msg.mentions.members.get(raw.slice(3, -1)));
			}
		},
		default: null
	},
	// <@!ID>
	USER_MENTION: {
		name: 'user mention',
		convert: function(raw, msg) {
			if (raw.startsWith('<@!') && raw.endsWith('>')) {
				return(msg.mentions.users.get(raw.slice(3, -1)));
			}
		},
		default: null
	},
	// <@&ID>
	ROLE_MENTION: {
		name: 'role mention',
		convert: function(raw, msg) {
			if (raw.startsWith('<@&') && raw.endsWith('>')) {
				return(msg.mentions.roles.get(raw.slice(3, -1)));
			}
		},
		default: null
	},
	// <#ID>
	CHANNEL_MENTION: {
		name: 'channel mention',
		convert: function(raw, msg) {
			if (raw === 'all') {
				return('all'); // Custom keyword for channel Parser.Argument
			}
			else if (raw.startsWith('<#') && raw.endsWith('>')) {
				return(msg.mentions.channels.get(raw.slice(2, -1)));
			}
			else {
				return(msg.guild.channels.filter(channel => channel.name === raw)[0]);
			}
		},
		default: null
	}
}

class OptionError extends Error {
	constructor(message) {
		super(message);
		this.name = 'OptionError';
	}
}

class MissingArgumentError extends Error {
	constructor(message) {
		super(message);
		this.name = 'MissingArgumentError';
	}
}

class Parser {

	constructor(msg, args) {
		this.msg = msg;
		this.args = args;

		this.parse();
	}

	parse() {
		var rawArgs = this.msg.content.split(' ');

		let i = 0;
		for (let key in this.args) {
			let arg = this.args[key];
			try {
				// Makes sure all parents (if any) have been assigned values
				// Child Parser.Arguments require all parents in order to considered valid.
				if (arg.allParentsValid()) {
					// Throws missing Parser.Argument error for a non-optional Parser.Argument that is not mentioned in command string. 					
					if ((i >= rawArgs.length || rawArgs[i] === '' || rawArgs[i] === undefined) && !arg.optional){
						throw new MissingArgumentError(`${arg.name}`);
					}
					else if (arg.type == Types.LONG_STRING) {
						arg.value = arg.type.convert(rawArgs.slice(i).join(' '), this.msg);
					}
					// If it exists, try and convert
					else {
						arg.value = arg.type.convert(rawArgs[i], this.msg);
					}

					// If conversion failed and throw TypeError (only for non-optional messages)
					if (arg.value === '' || arg.value === undefined || (arg.type === Types.NUMBER && isNaN(arg.value))) {
						if (!arg.optional) {
							throw new TypeError(`${arg.name}`);
						}
					}
					// If value do
					else if (arg.limits.length > 0 && !arg.limits.includes(arg.value)) {	
						throw new OptionError(`${arg.value} | Allowed: ${arg.limits.join(', ')}`);
					}
					// Successfully converted
					else {
						arg.used = true;
					}
					i++;
				}
			}
			catch (err) {
				arg.value = null;
				console.log(`${err.name}: ${err.message}`);
			}
		}
	}

	get(name) {
		let arg = this.args.filter(x => x.name == name)[0];

		return arg.value || arg.type.default;
	}

	isUsed(name) {
		let arg = this.args.filter(x => x.name == name)[0];

		return arg.used;
	}
}

class Argument {

	constructor(name, type, optional, limits = [], parents = []) {
		this.name = name;
		this.type = type;
		this.used = false;
		this.value = null;
		this.optional = optional;
		this.limits = limits;
		this.parents = parents;
	}

	allParentsValid() {
		return this.parents.every((parent) => parent.valid());
	}
}

class Parent {
	constructor(arg, conditions) {
		this.arg = arg;
		this.conditions = conditions;
	}

	valid() {
		return(this.conditions.includes(this.arg.value));
	}
}
/*
const args = [];
args.push(new Parser.Argument('command', Parser.Types.STRING, false, ['payout', 'fine', 'start']));

args.push(new Parser.Argument('action', Parser.Types.STRING, false, ['work', 'crime'], [new Parent(args[0], 'payout')]));
args.push(new Parser.Argument('payoutType', Parser.Types.STRING, false, ['min', 'max'], [new Parent(args[0], 'payout')]));
args.push(new Parser.Argument('payoutValue', Parser.Types.NUMBER, true, [], [new Parent(args[0], 'payout')]));

args.push(new Parser.Argument('crimeType', Parser.Types.STRING, false, ['min', 'max'], [new Parent(args[0], 'fine')]));
args.push(new Parser.Argument('crimeValue', Parser.Types.NUMBER, true, [], [new Parent(args[0], 'fine')]));

args.push(new Parser.Argument('startValue', Parser.Types.NUMBER, true, [], [new Parent(args[0], 'start')]))

const msg = {
	'content' : 'start'
}

const parser = new Parser.Parser(msg, args);
const x = parser.args;

console.log(parser.isUsed('startValue'));
*/
module.exports.Argument = Argument;
module.exports.Parent = Parent;
module.exports.Parser = Parser;
module.exports.Types = Types;

module.exports.OptionError = OptionError;
module.exports.MissingArgumentError = MissingArgumentError;
