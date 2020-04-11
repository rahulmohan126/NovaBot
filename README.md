# NovaBot

## About

This is a complex Discord bot, it allows you can have more control over your bots and build them out to your specifications. It includes multiple modules, such as music (allows YouTube audio playing from voice channels), moderation (manage your server by creating permission hierarchies and more), economy (all users have "accounts" in which they can play minigames to build their wealth)

This project is still in progress so report any bugs or issues and they will be fixed as soon as possible.

## Installation

##### Create a settings.json
```
{
	"BOTID":"Your client id",
	"OWNERID":"Your id",
	"PREFIX":"Your deafult prefix",
	"TOKEN":"Your client token",
	"GOOGLE_API_KEY":"Your api key"
}
```

Put all ids/tokens/keys in between the quotation marks.

### Creating a Bot

Login to your discord account and go to [this](https://discordapp.com/developers/applications/) link. Select "new application" and input a name. Once the application is created, copy the **client id** from General Information. Then select bot on the left and select "add bot" and confirm (you may need to change your application name in general information if too many users have this username). Once the bot is added, in the bot menu, select "click to reveal token" to get the **client token**.

To get your id, open up the discord app, go to settings -> appearance, then scroll down to Developer Mode and toggle it on. Then go to a server that you are in and find yourself in the member list and right-click. "Copy ID" should show up, click it and **your id** will automatically be copied to your clipboard.

**Your prefix** is up to you to choose, preferably pick something short and uncommon to start a message with such as "?".

For your API key, go to [this](https://developers.google.com/youtube/v3/getting-started) link and follow instructions 1-3 (make sure to create an unrestricted key). Then go to [this](https://console.developers.google.com/) link and go to the Credentials menu, under API keys, you should see the key you created, copy the **key** and paste it into your settings.json

:warning: DO NOT SHARE YOUR API KEY OR CLIENT TOKEN WITH ANYONE :warning:

### Requirements

1. node.js
3. discord.js
4. Using opusscript or node-opus, ytdl-core
5. simple-youtube-api

#### node.js
Go to [this](https://nodejs.org/en/download/) link and download the nodejs installer for your operating system.
Follow the installation steps to get node.js.
NPM (node package manager) is installed with Node.

#### discord.js

```
npm install -g discord.js
```

#### ytdl-core
Either use opusscript or node-opus

```
npm install -g opusscript ytdl-core
```

or

```
npm install -g node-opus ytdl-core
```

#### simple-youtube-api

```
npm install -g simple-youtube-api
```

## Usage

````
node path/to/bot.js
````
To terminate the bot just type stop into the shell and enter.

## Versions

() => optional parameter

[] => required parameter

### v1.1.0
New or edited commands:
* `loop` Loops the song.
* `seek [time]` Skips to the desired time of the song. Example "seek 1h 5m 3s".
* `invite` The old "info" command and been renamed and modified. Gives the invite URL so others can add the bot to there server.

New or improved features:
* Updated to [BoomBot](https://github.com/rahulmohan126/BoomBot) v1.2.0 

Other:
* Code moved to "src" folder.
* README updated.
* More code formatting and cleanup.

## License

MIT License - [LICENSE](LICENSE)
