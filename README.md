# counterstake-watchdog-discord
 Discord bot for counterstake-bridge events

Watch the [Obyte counterstake bridges](https://counterstake.org) and post notifications on Discord when fraudulent claims or challenges happen.

## Setup

- `yarn`
- Run with `node start.js`, it will create an app data directory in `~/.config/counterstake-watchdog-discord` then fail due to configuration missing.
- Configure the bot: edit `~/.config/counterstake-watchdog-discord/conf.json` or `./conf.js` and add required fields:
	- `admin_email`
	- `from_email`
	- `infura_project_id`
	- `discord_token`
	- `discord_channels`
- While logged on Discord webapp, create an application at https://discord.com/developers/applications 
- Select the application, select bot in menu, copy the bot token and paste it in conf.
- While logged on Discord, use the following url template to add the bot to your server: https://discord.com/oauth2/authorize?client_id=881946977754038272&scope=bot&permissions=2048, `client_id` can be found in the General Information of your Discord application (Application ID), permissions should be `2048` to allow only posting message.
- Run the bot with `node start.js`