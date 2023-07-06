const { SlashCommandBuilder } = require('discord.js');
const SSH = require('simple-ssh');
const fs = require('node:fs');
const ec2 = require('../../Services/ec2');
const { EC2_STATUS, ec2Ids } = require('../../constants/ec2');
require('dotenv').config();

const host = process.env.host;
const user = process.env.user;
const pemfile = process.env.pemfile;
const userpassword = process.env.userpassword;

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
          await interaction.followUp('伺服器正在開機中，稍後才能執行關機指令');
          break;
        case EC2_STATUS.running:
          // stopEC2(interaction);
          await interaction.followUp('可執行關機');
          break;
        case EC2_STATUS['shutting-down']:
          await interaction.followUp('伺服器已終止');
          break;
        case EC2_STATUS.terminated:
          await interaction.followUp('伺服器已終止');
          break;
        case EC2_STATUS.stopping:
          await interaction.followUp('伺服器已正在關機中');
          break;
        case EC2_STATUS.stopped:
          await interaction.followUp('伺服器已關機');
          break;
        default:
          break;
      }
    }
  });
};

const stopEC2 = async (interaction) => {
  const ssh = new SSH({
    host: host,
    user: user,
    key: fs.readFileSync(pemfile)
  });

  const prom = new Promise((resolve, reject) => {
    let ourout = "";
    ssh
      .exec('pzserver quit', {
        out: (stdout) => {
          ourout += stdout;
        }
      })
      .exec(`echo ${userpassword} | sudo -S halt`, {
        exit: () => {
          ourout += "\nSuccessfully Exited!";
          resolve(ourout);
        },
        out: (stdout) => {
          ourout += `\n${stdout}`;
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

  await interaction.followUp('已關機');

  console.log(res);
};

module.exports = {
  cooldown: 300,
  data: new SlashCommandBuilder()
    .setName('關機')
    .setDescription('保存 Project Zomboid 遊戲進度並關閉伺服器～'),
  async execute(interaction) {
    try {
      await interaction.reply('關機中...');
      checkEC2State(interaction);
    } catch (error) {
      interaction.followUp('指令程序有錯誤，請聯繫松山彭于晏');
      console.log(error);
    }
  },
};