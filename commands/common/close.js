const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('關機')
    .setDescription('還在開發中...'),
  async execute(interaction) {
    await interaction.reply('關機中...');
    await wait(4000);
    await interaction.editReply('已關機');
    // await interaction.deferReply();
    // await wait(4000);
    // await interaction.reply('已關機');
  },
};