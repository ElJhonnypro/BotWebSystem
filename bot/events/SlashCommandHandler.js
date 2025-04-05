const { getBotDataConfig } = require('../main')

module.exports = {
    name: 'interactionCreate',
    async execute(bot, interaction){
        if (!interaction.isCommand()) return;
        const command = bot.commands.get(interaction.commandName);
        if (!command) return;

        try {

            // Check if the user has the permissions / roles
            if (command.permissions) {
                const member = interaction.guild.members.cache.get(interaction.user.id);
                if (!member.hasPermission(command.permissions)) {
                    return interaction.reply({ content: 'You do not have the required permissions to execute this command!', flags: 64 });
                }
            }

            if (command.roles) {
                const member = interaction.guild.members.cache.get(interaction.user.id);
                if (!member.roles.cache.some(role => command.roles.includes(role.id))) {
                    return interaction.reply({ content: 'You do not have the required roles to execute this command!', flags: 64 });
                }
            }
            console.log("aca")
            console.log(interaction.guildId)
            await command.execute(getBotDataConfig(interaction.guildId), bot, interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while executing this command!', flags: 64 });
        }
    }

}