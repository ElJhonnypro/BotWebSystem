const { EmbedBuilder } = require('discord.js');

function createEmbed({ title, description, color = 'Random', footer, thumbnail, image, fields = [], author }) {
    const embed = new EmbedBuilder()
        .setTitle(title || 'Embed')
        .setColor(color === 'Random' ? Math.floor(Math.random() * 16777215) : parseInt(color))
        .setTimestamp(new Date());

    if (description && description.trim().length > 0) {
        embed.setDescription(description);
    }
    
    if (footer && footer.trim().length > 0) {
        embed.setFooter({ text: footer });
    }
    
    if (thumbnail) embed.setThumbnail(thumbnail);
    if (image) embed.setImage(image);
    if (fields.length) embed.addFields(fields);
    if (author && author.name && author.name.trim().length > 0) {
        embed.setAuthor(author);
    }
    
    return embed;
}

module.exports = { createEmbed };
