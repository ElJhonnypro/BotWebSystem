const { Client, IntentsBitField, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();
const NodeCache = require('node-cache');

const Mycache = new NodeCache({ stdTTL: 300 });


async function getBotDataConfig(daguild) {
  console.log("esto");
  try {
    const cacheKey = `data_${daguild}`;
    let data = Mycache.get(cacheKey);
    if (!data) {
      const res = await axios.post('http://localhost:4765/bot/getData', {
        guildid: daguild,
      });
      console.log("denuevo");
      data = res.data;
      Mycache.set(cacheKey, data)
    }
    return data;
  } catch (err) {
    console.error('Error fetching bot configuration:', err);
    return {};
  }
}



  module.exports = {
    getBotDataConfig,
    Mycache
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

bot.commands = new Collection()

async function eventHandler(eventsPath) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    
    if (event.once) {
        console.log(event.name)
        bot.once(event.name, (...args) => event.execute(bot, ...args));
        return;
    }
    console.log(event.name)
    bot.on(event.name, (...args) => event.execute(bot, ...args));
  }
}

async function commandHandler(commandPath) {
  const items = fs.readdirSync(commandPath);

  for (const item of items) {
    const fullPath = path.join(commandPath, item);
    const stat = fs.lstatSync(fullPath);

    if (stat.isDirectory()) {
      // Llama recursivamente si es un directorio
      await commandHandler(fullPath);
    } else if (item.endsWith('.js')) {
      const command = require(fullPath);

      if (!command.data ||!command.execute) {
        console.error(`Invalid command file (missing data or execute): ${item} ⚠️`);
        continue;
      }

      console.log(`Command registered: ${command.data.name}`)

      // Setea el comando en el cache y en la colección de comandos del bot
      bot.commands.set(command.data.name, command)

      //if (command.name) {
        //bot.application.commands.set(command.name, command);
        //console.log(`Command detected: ${command.name} ✅`);
      //} else {
        //console.error(`Invalid command object (without name): ${item} ❎`);
      //}
    }
  }
}


eventHandler(path.join(__dirname, 'events'));

bot.login(process.env.TOKEN)
    .then(async () => {
        console.log('✅ Bot logged');

        commandHandler(path.resolve(__dirname, 'commands/slashCommands'));
        try {

            if (bot.application) {
                await bot.application.commands.set(bot.commands.map(command => command.data));
                console.log('✅ Commands registered in Discord');
            } else {
                console.error('❌ No client.application');
            }
        } catch (error) {
            console.error('❌ Error:', error);
        }

        
    })
    .catch(err => console.error('❌ Error al conectar el bot:', err));


