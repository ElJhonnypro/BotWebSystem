const {getBotDataConfig} = require('../main')

module.exports = {
    name: 'messageCreate', 
    execute: async function(bot, message) {
        if (message.author.bot) return;
        data = await getBotDataConfig(message.channel.guild.id)
        const prefix = data.prefix;
        

        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase(); 

        // Comandos disponibles
        if (command === "ping") {
            message.reply("Pong!");
        }else if (command === "hello") {
            message.reply(data.message);
        } else {
            message.reply("No existing command!");
        }
    },
};
