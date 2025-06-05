const axios = require('axios');

module.exports.config = {
  name: 'riddle',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['riddle', 'funriddle'],
  description: 'Fetch a random riddle for some fun!',
  usage: 'riddle',
  credits: 'Rized',
  cooldown: 3,
};

module.exports.run = async function ({ api, event }) {
  api.sendMessage('⚙ Fetching a riddle, please wait...', event.threadID, event.messageID);

  try {
    const response = await axios.get('https://fetching-riddle-api.vercel.app/random');
    const data = response.data;

    if (!data || !data.riddle) {
      return api.sendMessage(
        '🥺 Sorry, I couldn\'t find a riddle.',
        event.threadID,
        event.messageID
      );
    }

    const riddle = data.riddle;
    api.sendMessage(
      `🧩 Here is your riddle:\n\n${riddle}`,
      event.threadID,
      event.messageID
    );
  } catch (error) {
    console.error(error);
    api.sendMessage(
      `❌ An error occurred: ${error.message}`,
      event.threadID,
      event.messageID
    );
  }
};