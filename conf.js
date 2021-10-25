"use strict";

exports = require('counterstake-bridge/conf.js'); // read bridge conf

exports.infura_project_id = ''; // in conf.json

exports.discord_token = '';
exports.discord_channels = [''];

exports.explorerURLs = {
	'Obyte' : `https://${process.env.testnet ? 'testnet' : ''}explorer.obyte.org/#`,
	'Ethereum': `https://${process.env.testnet ? 'rinkeby.' : ''}etherscan.io/`
};

module.exports = exports;

console.log('finished conf');
