const axios = require('axios');

module.exports.config = {
  name: 'fact',
  version: '1.0.1',
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: 'Fetch a random interesting fact',
  usage: 'fact',
  credits: 'developer',
  cooldown: 3,
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  const apiUrl = 'https://api.popcat.xyz/v2/fact';

  try {
    const { data } = await axios.get(apiUrl);

    if (data.error) {
      throw new Error('API returned an error');
    }

    const fact = data.message.fact;
    const message = `🧠 Random Fact:\n\n${fact}`;

    return api.sendMessage(message, threadID, messageID);
  } catch (error) {
    console.error('Fact command error:', error.message);
    return api.sendMessage('❌ Error: Unable to retrieve fact.', threadID, messageID);
  }
};