module.exports = {
    name: "hello",
    execute: async (config, client, message, args) => {
        const guildMessage = await config.message;
        message.reply(`The message of the day: ${guildMessage}`);
    }
}