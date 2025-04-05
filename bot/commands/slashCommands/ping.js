const { SlashCommandBuilder } = require('discord.js');
const { infoEmbed } = require('../utils/embeds/InfoEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Shows the ping of the bot and API'),
  
  async execute(guildConfig, bot, interaction) {
    try {
      const botPing = bot.ws.ping;
      
      const embed = infoEmbed("Ping of the bot and API", [
        { name: 'Bot ping 🤓', value: `**${botPing}ms**`, inline: true },
      ], "Bot ping command.");
      
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error while fetching bot and API ping:', error);
      await interaction.reply({ content: 'An error occurred while fetching the ping.', ephemeral: true });
    }
  }
};
