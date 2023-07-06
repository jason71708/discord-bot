const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const ec2 = require('../../Services/ec2');
const { EC2_STATUS, ec2Ids } = require('../../constants/ec2');
require('dotenv').config();

const params = {
  InstanceIds: [
    ...ec2Ids
  ]
};

const checkEC2State = (interaction) => {
  ec2.describeInstanceStatus(params, async (err, data) => {
    if (err) {
      console.log(err, err.stack);
      await interaction.followUp('指令程序有錯誤，請聯繫松山彭于晏');
    } else {
      switch (data.InstanceStatuses[0].InstanceState.Code) {
        case EC2_STATUS.pending:
          await interaction.followUp('伺服器正在開機中');
          break;
        case EC2_STATUS.running:
          await interaction.followUp('伺服器已開機');
          break;
        case EC2_STATUS['shutting-down']:
          await interaction.followUp('伺服器已終止');
          break;
        case EC2_STATUS.terminated:
          await interaction.followUp('伺服器已終止');
          break;
        case EC2_STATUS.stopping:
          await interaction.followUp('伺服器正在關機中，稍後才能執行開機指令');
          break;
        case EC2_STATUS.stopped:
          startEC2(interaction);
          break;
        default:
          break;
      }
    }
  });
};

const startEC2 = (interaction) => {
  ec2.startInstances(params, async (err, data) => {
    if (err) {
      console.log(err, err.stack);
      await interaction.followUp('指令程序有錯誤，請聯繫松山彭于晏');
    } else {
      await wait(3 * 60 * 1000); // wait for game server start
      await interaction.followUp('已開機');
    };
  });
};

module.exports = {
  cooldown: 300,
  data: new SlashCommandBuilder()
    .setName('開機')
    .setDescription('開啟 Project Zomboid 遊戲伺服器～'),
  async execute(interaction) {
    try {
      await interaction.reply('開機中...');
      checkEC2State(interaction);
    } catch (error) {
      interaction.followUp('指令程序有錯誤，請聯繫松山彭于晏');
      console.log(error);
    }
  },
};