const { getBotDataConfig } = require("../main");


module.exports = {
    name: 'ready',
    once: true,
    async execute(client, args) {
        console.log(`Logged in as ${client.user.tag}!`);
    }
}