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
    .setDescription('還在開發中...'),
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
        .exec('pzserver command players', {
          exit: () => {
            ourout += "\nSuccessfully Exited!";
            resolve(ourout);
          },
          out: (stdout) => {
            ourout += stdout;
          }
        })
        .start({
          fail: (e) => {
            console.log(e);
            reject(e);
          }
        });
    });

    console.log('wait ssh');

    const res = await prom;

    console.log('complete ssh');

    await interaction.editReply(res);
    // await interaction.deferReply();
    // await wait(4000);
    // await interaction.reply('已關機');
  },
};