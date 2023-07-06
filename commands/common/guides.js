const { SlashCommandBuilder } = require('discord.js');
require('dotenv').config();
const { characters, raids, others } = require('../../constants/soulworker');

const options = Object.assign({}, characters, raids, others);

const choices = Object.keys(options).map(k => ({ name: k, value: k }));

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('攻略')
    .setDescription('給你這個懶人用的')
    .addStringOption(option =>
      option.setName('選項')
        .setDescription('選個吧')
        .setRequired(true)
        .addChoices(
          ...choices
        )
    ),
  async execute(interaction) {
    try {
      const optionName = interaction.options.getString('選項') ?? '';
      if (optionName) {
        await interaction.reply(`${optionName}攻略:\n${options[optionName]}`);
      } else {
        await interaction.reply('請選擇有效選項');
      }
    } catch (error) {
      interaction.followUp('指令程序有錯誤，請聯繫松山彭于晏');
      console.log(error);
    }
  },
};