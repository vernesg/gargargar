const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const BASE_URL = 'https://betadash-search-download.vercel.app/sc';

module.exports.config = {
  name: "soundcloud",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ['scplay', 'scmusic'],
  usage: 'soundcloud [song name]',
  description: 'Searches SoundCloud for music and plays audio',
  credits: 'developer',
  cooldown: 5
};

module.exports.run = async function ({ api, event, args }) {
  const songName = args.join(' ');
  if (!songName) {
    return api.sendMessage(`❗ Please provide the title of the song.`, event.threadID, event.messageID);
  }

  api.sendMessage(`🔍 Searching SoundCloud for "${songName}"...`, event.threadID, event.messageID);

  try {
    const url = `${BASE_URL}?search=${encodeURIComponent(songName)}`;

    // HEAD request to check file size
    const headRes = await axios.head(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json',
      }
    });

    const fileSize = parseInt(headRes.headers['content-length'], 10);
    const isTooLarge = fileSize > 25 * 1024 * 1024;

    const thumbnail = 'https://i.imgur.com/sVpNeaG.jpeg';

    // Send UI preview card with link
    const previewMessage = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [{
            title: `Here is your SoundCloud track: ${songName}`,
            image_url: thumbnail,
            subtitle: isTooLarge
              ? '⚠️ File exceeds 25MB. Use the link to download.'
              : 'Preparing to send audio...',
            buttons: [{
              type: 'web_url',
              url,
              title: isTooLarge ? 'Download File' : 'Open in Browser'
            }]
          }]
        }
      }
    };

    await api.sendMessage(previewMessage, event.threadID, event.messageID);

    if (isTooLarge) return;

    // Proceed to download and send the audio file
    const fileName = `${Date.now()}_soundcloud.mp3`;
    const filePath = path.join(__dirname, 'cache', fileName);
    const writer = fs.createWriteStream(filePath);

    const response = await axios({
      method: 'GET',
      url,
      responseType: 'stream'
    });

    response.data.pipe(writer);

    writer.on('finish', () => {
      const size = fs.statSync(filePath).size;
      if (size > 25 * 1024 * 1024) {
        fs.unlinkSync(filePath);
        return api.sendMessage(`⚠️ The file is too large to send (over 25MB).`, event.threadID, event.messageID);
      }

      const message = {
        body: `🎶 ${songName}`,
        attachment: fs.createReadStream(filePath)
      };

      api.sendMessage(message, event.threadID, () => {
        fs.unlinkSync(filePath);
      }, event.messageID);
    });

    writer.on('error', (err) => {
      console.error('Write error:', err);
      api.sendMessage(`❌ Failed to download audio.`, event.threadID, event.messageID);
    });

  } catch (err) {
    console.error('SoundCloud error:', err.message);
    api.sendMessage(`❌ An error occurred while processing your request.`, event.threadID, event.messageID);
  }
};