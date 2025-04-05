const { createEmbed } = require('./embedBuilder');

function infoEmbed(title, fields = [], footerText = null) {
    return createEmbed({
        color: 0x0091ef,
        title: title ? title : "Info ℹ️",
        description: "",
        fields,
        footer: footerText,
    });
}

module.exports = { infoEmbed };
