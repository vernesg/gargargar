const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

// Helper to split long messages
function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}

module.exports = {
  name: 'chords',
  description: 'Search for guitar chords by song title.',

  async execute(senderId, args, pageAccessToken) {
    const query = args.join(' ').trim();

    if (!query) {
      return sendMessage(senderId, {
        text: '𝗘𝗿𝗿𝗼𝗿: 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝗮 𝘀𝗼𝗻𝗴 𝘁𝗶𝘁𝗹𝗲.\n𝗘𝘅𝗮𝗺𝗽𝗹𝗲: chords dilaw by maki'
      }, pageAccessToken);
    }

    try {
      const apiUrl = `https://wrapped-rest-apis.vercel.app/api/chords?title=${encodeURIComponent(query)}`;
      const { data } = await axios.get(apiUrl);

      if (!data.success || !data.chords) {
        return sendMessage(senderId, {
          text: '𝗘𝗿𝗿𝗼𝗿: 𝗦𝗼𝗻𝗴 𝗰𝗵𝗼𝗿𝗱𝘀 𝗻𝗼𝘁 𝗳𝗼𝘂𝗻𝗱.'
        }, pageAccessToken);
      }

      let message = `
─────────────
𝗧𝗶𝘁𝗹𝗲: ${data.chords.title}\n𝗔𝗿𝘁𝗶𝘀𝘁: ${data.chords.artist}\n𝗞𝗲𝘆: ${data.chords.key}\n𝗧𝘆𝗽𝗲: ${data.chords.type}\n𝗟𝗶𝗻𝗸: ${data.chords.url}\n\n𝗖𝗵𝗼𝗿𝗱𝘀:\n${data.chords.chords}
─────────────`;

      // If message too long, split it
      if (message.length > 2000) {
        const chunks = splitMessageIntoChunks(message, 1900); // a bit safer
        for (const chunk of chunks) {
          await sendMessage(senderId, { text: chunk }, pageAccessToken);
        }
      } else {
        await sendMessage(senderId, { text: message }, pageAccessToken);
      }

    } catch (error) {
      console.error('Error fetching chords:', error.message);
      return sendMessage(senderId, {
        text: '𝗘𝗿𝗿𝗼𝗿: 𝗔𝗻 𝘂𝗻𝗲𝘅𝗽𝗲𝗰𝘁𝗲𝗱 𝗲𝗿𝗿𝗼𝗿 𝗼𝗰𝗰𝘂𝗿𝗿𝗲𝗱. 𝗣𝗹𝗲𝗮𝘀𝗲 𝘁𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗹𝗮𝘁𝗲𝗿.'
      }, pageAccessToken);
    }
  }
};