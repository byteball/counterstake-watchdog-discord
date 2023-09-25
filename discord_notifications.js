const Discord = require('discord.js');
const conf = require('ocore/conf.js');
const eventBus = require('ocore/event_bus.js');
const db = require('ocore/db.js');
const transfers = require('counterstake-bridge/transfers.js');

var discordClient = null;

async function init(activityString) {
	if (!conf.discord_token)
		throw Error("discord_token missing in conf");
	if (!conf.discord_channels || !conf.discord_channels.length)
		throw Error("channels missing in conf");
	discordClient = new Discord.Client();
	discordClient.on('ready', () => {
		console.log(`Logged in Discord as ${discordClient.user.tag}!`);
	});
	discordClient.on('error', (error) => {
		console.error(`Discord error: ${error}`);
	});
	await discordClient.login(conf.discord_token);
	return setBotActivity(activityString);
};

function setBotActivity(prefix){
	prefix = prefix ? (prefix + " ") : "";
	return discordClient.user.setActivity(prefix, {type: "WATCHING"}); 
}

async function parseBridgeValues(bridge, type) {
	let b = {};
	Object.assign(b, bridge); // copy
	b.network = type === 'expatriation' ? b.foreign_network : b.home_network;
	b.opposite_network = type === 'expatriation' ? b.home_network : b.foreign_network;
	
	b.src_asset = type === 'expatriation' ? b.home_asset : b.foreign_asset;
	b.src_symbol = type === 'expatriation' ? b.home_symbol : b.foreign_symbol;
	b.src_asset_decimals = type === 'expatriation' ? b.home_asset_decimals : b.foreign_asset_decimals;
	
	b.dst_asset = type === 'expatriation' ? b.foreign_asset : b.home_asset;
	b.dst_symbol = type === 'expatriation' ? b.foreign_symbol : b.home_symbol;
	b.dst_asset_decimals = type === 'expatriation' ? b.foreign_asset_decimals : b.home_asset_decimals;

	b.stake_asset = type === 'expatriation' ? b.stake_asset : b.home_asset;
	b.stake_symbol = await transfers.networkApi[b.network].getSymbol(b.stake_asset) || 'tokens';
	b.stake_asset_decimals = b.stake_asset === 'base' ? 9 : (type === 'expatriation' ? b.foreign_asset_decimals : b.home_asset_decimals);

	return b;
}

eventBus.on("fraudulent_claim", async (bridge, type, claim_num, sender_address, dest_address, claimant_address, data, amount, reward, stake, txid, txts, claim_txid) => {
	const b = await parseBridgeValues(bridge, type);

	const msg = new Discord.MessageEmbed().setColor('#912200');
	msg.setTitle(`Fraudulent claim of ${b.dst_symbol} on ${b.home_network} → ${b.foreign_network} bridge in ${b.network} network (#${claim_num})`)
		.setDescription(`[Claim tx in explorer](${getExplorerURL(b.network, 'tx', claim_txid)})

			${claimant_address} tries to claim **${applyDecimals(amount, b.dst_asset_decimals)} ${b.dst_symbol}**`)
		.addFields(
			{ name: "Sender address", value: `[${sender_address}](${getExplorerURL(b.opposite_network, 'address', sender_address)})`, inline: true},
			{ name: "Dest Address", value: `[${dest_address}](${getExplorerURL(b.network, 'address', dest_address)})`, inline: true},
			{ name: '\u200B', value: '\u200B' , inline: true},
			{ name: "Src txid", value: `[${txid}](${getExplorerURL(b.opposite_network, 'tx', txid)})`, inline: true},
			{ name: "Stake", value: `${applyDecimals(stake, b.stake_asset_decimals)} ${b.stake_symbol}`, inline: true},
			{ name: '\u200B', value: '\u200B' , inline: true}
		)
	sendToDiscord(msg);
});

eventBus.on("challenge", async (bridge, type, claim_num, address, stake_on, stake, challenge_txid, claim, valid_outcome) => {
	if (!claim) return;
	const b = await parseBridgeValues(bridge, type);

	const msg = new Discord.MessageEmbed().setColor('#004491');
	msg.setTitle(`Challenge on claim #${claim_num} on ${b.home_network} → ${b.foreign_network} bridge in ${b.network} network`)
		.setDescription(`[Challenge tx in explorer](${getExplorerURL(b.network, 'tx', challenge_txid)})

			${address} challenges claim #${claim_num}`)
		.addFields(
			{ name: "Challenge amount", value: `${applyDecimals(stake, b.stake_asset_decimals)} ${b.stake_symbol}`, inline: true},
			{ name: "Stake on", value: stake_on, inline: true},
			{ name: '\u200B', value: '\u200B' , inline: true},
			{ name: "Current outcome", value: claim.current_outcome, inline: true},
			{ name: "Valid outcome", value: valid_outcome, inline: true},
			{ name: '\u200B', value: '\u200B' , inline: true},
			{ name: "Challenging target", value: `${applyDecimals(claim.challenging_target, b.stake_asset_decimals)} ${b.stake_symbol}`, inline: true},
			{ name: "Valid outcome stake", value: `${applyDecimals(claim.stakes[valid_outcome], b.stake_asset_decimals)} ${b.stake_symbol}`, inline: true},
			{ name: '\u200B', value: '\u200B' , inline: true}
		)
	sendToDiscord(msg);
});

function sendToDiscord(to_be_sent){
	if (!discordClient)
		return console.log("discord client not initialized");
	if (process.env.mute)
		return console.log("client muted");
	conf.discord_channels.forEach(function(channelId){
		discordClient.channels.fetch(channelId).then(function(channel){
			channel.send(to_be_sent);
		});
	});
}

function applyDecimals(amount, decimals){
	if (!amount)
		return 0;
	return amount / (10 ** decimals);
}

function getExplorerURL(network, type, arg) {
	switch (network) {
		case "Obyte":
			return `${conf.explorerURLs[network]}${arg}`;
		case "Ethereum":
		case "BSC":
		case "Polygon":
		case "Kava":
			return `${conf.explorerURLs[network]}${type}/${arg}`;
	}
}

exports.init = init;
exports.setBotActivity = setBotActivity;