const chalk = require('chalk');

const guildWelcomeMessagesSchema = require('./classes/guild-welcome-messages-schema');

module.exports = Kirbi => {
	Kirbi.Config.discord.welcomeMessages = [];
	require('./lib/on-event')(Kirbi);

	return {
		commands: [
			'welcome'
		],
		welcome: {
			usage: `<text you want to send to a user>`,
			description: 'sets the message to be sent to a user when they join your guild; use {guild} for guild name',
			process: (msg, suffix, isEdit, cb) => {
				if (!isEdit) {
					const guildWelcomeMessagesSet = Kirbi.Database.model('GuildWelcomeMessagesSchema', guildWelcomeMessagesSchema);

					guildWelcomeMessagesSet.findOneAndUpdate({ guildId: msg.guild.id }, { $set: { welcomeMessage: suffix } }, { upsert: true }, (err, result) => {
						if (err) {
							console.log(chalk.red(err));
							cb('Error saving welcome message.', msg);
						} else {
							if (!result) {
								result = guildWelcomeMessagesSchema;
								result.welcomeMessage = suffix;
							}

							result.save();

							Kirbi.Config.discord.welcomeMessages[msg.guild.id] = suffix;
							cb(`Set welcome message for ${msg.guild.name} to ${suffix}.`, msg);
						}
					});
				}
			}
		}
	};
};
