const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const SEARCH_URL = 'https://kaiz-apis.gleeze.com/api/ytsearch';
const DOWNLOAD_URL = 'https://api.zetsu.xyz/download/youtube';
const SEARCH_API_KEY = '8aa2f0a0-cbb9-40b8-a7d8-bba320cb9b10';
const DOWNLOAD_API_KEY = '80836f3451c2b3392b832988e7b73cdb';

module.exports.config = {
  name: "ytvideo",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ['ytv'],
  usage: 'ytvideo [video name]',
  description: 'Search and download a YouTube video',
  credits: 'developer',
  cooldown: 5
};

module.exports.run = async function ({ api, event, args }) {
  const query = args.join(' ');
  if (!query) {
    return api.sendMessage(`❌ Please provide a video title or query.`, event.threadID, event.messageID);
  }

  try {
    api.sendMessage(`🔍 Searching for "${query}"...`, event.threadID, event.messageID);

    // Search for YouTube video
    const searchRes = await axios.get(SEARCH_URL, {
      params: {
        q: query,
        apikey: SEARCH_API_KEY
      }
    });

    const video = searchRes.data?.items?.[0];
    if (!video) {
      return api.sendMessage(`⚠️ No video found.`, event.threadID, event.messageID);
    }

    const { title, url, thumbnail } = video;

    // Get download link
    const downloadRes = await axios.get(DOWNLOAD_URL, {
      params: {
        url,
        apikey: DOWNLOAD_API_KEY
      }
    });

    const result = downloadRes.data?.result;
    const bestMedia = result?.medias?.find(m => m.ext === 'mp4') || result?.medias?.[0];

    if (!bestMedia?.url) {
      return api.sendMessage(`⚠️ No valid video format found.`, event.threadID, event.messageID);
    }

    // Download video to cache
    const filename = `${Date.now()}_ytvideo.mp4`;
    const filePath = path.join(__dirname, 'cache', filename);
    const writer = fs.createWriteStream(filePath);

    const stream = await axios({
      method: 'GET',
      url: bestMedia.url,
      responseType: 'stream'
    });

    stream.data.pipe(writer);

    writer.on('finish', () => {
      const fileSize = fs.statSync(filePath).size;
      if (fileSize > 25 * 1024 * 1024) {
        fs.unlinkSync(filePath);
        return api.sendMessage(`⚠️ The file is too large to send (over 25MB).`, event.threadID, event.messageID);
      }

      const message = {
        body: `🎬 ${result.title}\nQuality: ${bestMedia.label || 'Unknown'}\nDuration: ${result.duration || 'N/A'}`,
        attachment: fs.createReadStream(filePath)
      };

      api.sendMessage(message, event.threadID, () => {
        fs.unlinkSync(filePath);
      }, event.messageID);
    });

    writer.on('error', (err) => {
      console.error('File write error:', err);
      api.sendMessage(`❌ Failed to save video.`, event.threadID, event.messageID);
    });

  } catch (err) {
    console.error('YouTube video error:', err.message);
    api.sendMessage(`❌ An unexpected error occurred.`, event.threadID, event.messageID);
  }
};