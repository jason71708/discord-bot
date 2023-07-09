const { SlashCommandBuilder } = require('discord.js');
const SSH = require('simple-ssh');
const fs = require('node:fs');
const wait = require('node:timers/promises').setTimeout;
const ec2 = require('../../Services/ec2');
const { EC2_STATUS, ec2Ids } = require('../../constants/ec2');
const { roleNames } = require('../../constants/guild');
require('dotenv').config();

const host = process.env.host;
const user = process.env.user;
const pemfile = process.env.pemfile;

const describeInstanceStatusParams = {
  IncludeAllInstances: true,
  InstanceIds: [
    ...ec2Ids
  ]
};

const startInstancesParams = {
  InstanceIds: [
    ...ec2Ids
  ]
};

const checkEC2State = (interaction) => {
  ec2.describeInstanceStatus(describeInstanceStatusParams, async (err, data) => {
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
  ec2.startInstances(startInstancesParams, async (err, data) => {
    if (err) {
      console.log(err, err.stack);
      await interaction.followUp('指令程序有錯誤，請聯繫松山彭于晏');
    } else {
      console.log('starting server');
      startGameServer(interaction);
    };
  });
};

const startGameServer = (interaction) => {
  ec2.waitFor('instanceStatusOk', startInstancesParams, async (err, data) => {
    if (err) {
      console.log(err, err.stack);
      await interaction.followUp('指令程序有錯誤，請聯繫松山彭于晏');
    } else {
      const ssh = new SSH({
        host: host,
        user: user,
        key: fs.readFileSync(pemfile)
      });

      const prom = new Promise((resolve, reject) => {
        ssh
          .exec('pzserver start', {
            out: (stdout) => {
              resolve(stdout + ' game server start');
            }
          })
          .start({
            fail: (e) => {
              console.log(e);
              reject(e);
            }
          });
      });

      const res = await prom;
      console.log(res);

      await interaction.followUp('已開機');
    }
  });
};

module.exports = {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName('開機')
    .setDescription('開啟 Project Zomboid 遊戲伺服器～'),
  async execute(interaction) {
    try {
      await interaction.reply('處理中...');
      const hasPermission = interaction.member.roles.cache.find(r => {
        return roleNames.some(n => r.name.includes(n));
      });
      if (!hasPermission) {
        return interaction.followUp('您無權限使用此指令');
      }
      await interaction.editReply('開機中...');
      checkEC2State(interaction);
    } catch (error) {
      console.log(error);
      interaction.followUp('指令程序有錯誤，請聯繫松山彭于晏');
    }
  },
};