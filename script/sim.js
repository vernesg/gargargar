const axios = require('axios');

module.exports.config = {
  name: 'sim',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['simsimi', 'chatbot'],
  description: 'Talk with the SimSimi API',
  usage: 'sim [message]',
  credits: 'Developer',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const senderId = event.senderID;
  const query = args.join(' ').trim();

  if (!query) {
    return api.sendMessage(
      'Error: Please provide a message.\nExample: sim Hello!',
      event.threadID,
      event.messageID
    );
  }

  const waitingMessage = 'Please wait, talking to SimSimi...';
  api.sendMessage(waitingMessage, event.threadID, async (err, info) => {
    if (err) return;

    try {
      const apiKey = '2a5a2264d2ee4f0b847cb8bd809ed34bc3309be7';
      const apiUrl = `https://simsimi.ooguy.com/sim?query=${encodeURIComponent(query)}&apikey=${apiKey}`;
      const { data } = await axios.get(apiUrl);

      if (!data || !data.respond) {
        return api.editMessage('Error: No response from Sim API.', info.messageID);
      }

      return api.editMessage(data.respond, info.messageID);
    } catch (error) {
      console.error('Sim command error:', error.message);
      return api.editMessage('Error: Failed to connect to Sim API.', info.messageID);
    }
  });
};