"use strict";

exports = require('counterstake-bridge/conf.js'); // read bridge conf

exports.infura_project_id = ''; // in conf.json
exports.admin_email = '';
exports.from_email = '';

exports.discord_token = '';
exports.discord_channels = [''];
exports.bClaimForOthers = false;
exports.bAttack = false;

exports.socksHost = null;

exports.explorerURLs = {
	'Obyte' : `https://${process.env.testnet ? 'testnet' : ''}explorer.obyte.org/#`,
	'Ethereum': `https://${process.env.testnet ? 'rinkeby.' : ''}etherscan.io/`,
	'BSC': `https://${process.env.testnet ? 'testnet.' : ''}bscscan.com/`,
	'Polygon': `https://${process.env.testnet ? 'mumbai.' : ''}polygonscan.com/`
};

exports.webPort = null;

module.exports = exports;

console.log('finished conf');
