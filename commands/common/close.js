const fs = require('node:fs');
const { SlashCommandBuilder } = require('discord.js');
const SSH = require('simple-ssh');
require('dotenv').config();

const host = process.env.host;
const user = process.env.user;
const pemfile = process.env.pemfile;
// const wait = require('node:timers/promises').setTimeout;

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('關機')
    .setDescription('儲存遊戲進度並關閉伺服器～'),
  async execute(interaction) {
    await interaction.reply('關機中...');

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
        .exec('sudo halt', {
          exit: () => {
            // ourout += "\nSuccessfully Exited!";
            resolve();
          },
          out: (stdout) => { }
        })
        .start({
          fail: (e) => {
            console.log(e);
            reject(e);
          }
        });
    });

    await prom;
    // const res = await prom;

    await interaction.editReply('已關機');
    // await interaction.deferReply();
    // await wait(4000);
    // await interaction.reply('已關機');
  },
};