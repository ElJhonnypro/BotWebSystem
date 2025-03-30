const { Client, IntentsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

async function getBotDataConfig(daguild) {
    try {
      const res = await axios.post('http://localhost:4765/settings/getData', {
        guildid: daguild
      });
      return res.data;
    } catch (err) {
      console.error('Error fetching bot configuration:', err);
      return {};
    }
  }

  module.exports = {
    getBotDataConfig
  }

const bot = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessageReactions,
  ],
});

async function eventHandler(eventsPath) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    let config = await getBotDataConfig();
    console.log(config)
  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    
    if (event.once) {
        console.log(event.name)
        bot.once(event.name, (...args) => event.execute(bot, args));
        return;
    }
    console.log(event.name)
    bot.on(event.name, (...args) => event.execute(bot, ...args));
  }
}

eventHandler(path.join(__dirname, 'events'));

bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.tag}!`);
});

bot.login(process.env.TOKEN);