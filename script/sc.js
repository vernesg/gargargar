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
    const searchUrl = `${BASE_URL}?search=${encodeURIComponent(songName)}`;

    // HEAD request to get file size
    const headRes = await axios.head(searchUrl);
    const fileSize = parseInt(headRes.headers['content-length'], 10);

    if (!fileSize || isNaN(fileSize)) {
      return api.sendMessage(`❌ No track found or invalid file.`, event.threadID, event.messageID);
    }

    if (fileSize > 25 * 1024 * 1024) {
      return api.sendMessage(`⚠️ File is too large to send (over 25MB). Try downloading manually:\n${searchUrl}`, event.threadID, event.messageID);
    }

    // Download the file
    const fileName = `${Date.now()}_soundcloud.mp3`;
    const filePath = path.join(__dirname, 'cache', fileName);
    const writer = fs.createWriteStream(filePath);

    const audioStream = await axios({
      method: 'GET',
      url: searchUrl,
      responseType: 'stream'
    });

    audioStream.data.pipe(writer);

    writer.on('finish', () => {
      const downloadedSize = fs.statSync(filePath).size;
      if (downloadedSize > 25 * 1024 * 1024) {
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