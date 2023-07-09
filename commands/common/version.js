const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('版本')
    .setDescription('檢查機器人版本'),
  async execute(interaction) {
    await interaction.reply('1.0.6');
  },
};