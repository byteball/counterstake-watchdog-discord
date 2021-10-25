/*jslint node: true */
"use strict";
const eventBus = require('ocore/event_bus.js');
const conf = require('ocore/conf.js');
const discord = require('./discord_notifications.js');

require('counterstake-bridge/run.js');

eventBus.on('headless_wallet_ready', async () => {
	if (conf.discord_token) {
		await discord.init('fraudulent claims');
	}
});