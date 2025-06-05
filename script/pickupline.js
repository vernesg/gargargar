const axios = require('axios');

module.exports.config = {
  name: 'pickupline',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: 'Fetch a random pick-up line',
  usage: 'pickupline',
  credits: 'developer',
  cooldown: 3,
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  const API_BASE = 'https://kaiz-apis.gleeze.com/api';
  const API_KEY = '8062a9eb-2a2e-458b-a1f0-4cd25de8b000';
  const apiUrl = `${API_BASE}/pickuplines`;

  try {
    const { data } = await axios.get(apiUrl, {
      params: { apikey: API_KEY }
    });

    const pickupline = data.pickupline || 'No pick-up line found.';
    const message = `𝗣𝗶𝗰𝗸𝘂𝗽 𝗟𝗶𝗻𝗲:\n\n${pickupline}`;

    return api.sendMessage(message, threadID, messageID);
  } catch (error) {
    console.error('Pickupline command error:', error.message);
    return api.sendMessage('❌ Error: Unable to retrieve pick-up line.', threadID, messageID);
  }
};