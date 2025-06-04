const axios = require('axios');

module.exports.config = {
  name: 'nglspam',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['ngl', 'nglspammer'],
  description: 'Send spam messages to NGL user',
  usage: 'nglspam <username> | <amount> | <message>',
  credits: 'Developer',
  cooldown: 5,
};

module.exports.run = async function({ api, event, args }) {
  const senderId = event.senderID;
  const input = args.join(' ').split('|').map(item => item.trim());

  if (input.length < 3) {
    return api.sendMessage(
      'Error: Missing parameters.\nUsage: nglspam <username> | <amount> | <message>',
      event.threadID,
      event.messageID
    );
  }

  const [username, amount, message] = input;

  const waitingMessage = 'Sending messages to NGL... Please wait.';
  api.sendMessage(waitingMessage, event.threadID, async (err, info) => {
    if (err) return;

    try {
      const apiUrl = `https://mademoiselle2-rest-apis.onrender.com/api/nglspam?username=${encodeURIComponent(username)}&amount=${encodeURIComponent(amount)}&message=${encodeURIComponent(message)}`;
      const { data } = await axios.get(apiUrl);

      if (data.error) {
        return api.editMessage(`Error: ${data.message}`, info.messageID);
      }

      return api.editMessage(`Success: ${data.message}`, info.messageID);
    } catch (error) {
      console.error('nglspam error:', error.message);
      return api.editMessage(
        'Error: Failed to send request to NGL API.',
        info.messageID
      );
    }
  });
};
