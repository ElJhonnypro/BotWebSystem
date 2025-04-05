const {getBotDataConfig} = require('../main')
const fs = require('fs')

const path = require('path');

let commands = {

}

async function commandHandler(commandPath) {
    const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));
  

    for (const file of commandFiles) {
      const command = require(path.join(commandPath, file));
      
      console.log(command.name)
      if (command.name) {
        commands[command.name] = command;
      } else {
        console.error(`Invalid command file: ${file}`);
      }
    }
  }

  commandHandler(path.join(__dirname, '../commands/prefixCommands'));

module.exports = {
    name: 'messageCreate', 
    execute: async function(bot, message) {
        if (message.author.bot) return;
        data = await getBotDataConfig(message.channel.guild.id)
        console.log("otro")
        const prefix = data.prefix;
        console.log(data)
        

        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase(); 

        // Comandos disponibles
        if (command in commands) {
            commands[command].execute(data, bot, message, args);
        }

    },
};
