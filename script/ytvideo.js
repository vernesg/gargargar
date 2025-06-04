const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const SEARCH_URL = 'https://kaiz-apis.gleeze.com/api/ytsearch';
const DOWNLOAD_URL = 'https://api.zetsu.xyz/download/youtube';
const SEARCH_API_KEY = 'ec7d563d-adae-4048-af08-0a5252f336d1';
const DOWNLOAD_API_KEY = '80836f3451c2b3392b832988e7b73cdb';

module.exports.config = {
  name: "ytvideo",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ['playvideo', 'ytv'],
  usage: 'ytvideo [video name]',
  description: 'Searches YouTube and sends the video as attachment',
  credits: 'Ry + GPT',
  cooldown: 5
};

module.exports.run = async function ({ api, event, args }) {
  const videoName = args.join(' ');
  if (!videoName) {
    return api.sendMessage(`❗ Please provide the video title.`, event.threadID, event.messageID);
  }

  api.sendMessage(`🔍 Searching for "${videoName}"...`, event.threadID, event.messageID);

  try {
    // Search YouTube
    const searchRes = await axios.get(SEARCH_URL, {
      params: { q: videoName, apikey: SEARCH_API_KEY }
    });

    const item = searchRes.data?.items?.[0];
    if (!item) {
      return api.sendMessage(`❌ No video found.`, event.threadID, event.messageID);
    }

    const { title, url, duration } = item;

    // Get download link
    const downloadRes = await axios.get(DOWNLOAD_URL, {
      params: { url, apikey: DOWNLOAD_API_KEY }
    });

    const result = downloadRes.data?.result;
    const bestMedia = result?.medias?.find(m => m.ext === 'mp4') || result?.medias?.[0];
    if (!bestMedia?.url) {
      return api.sendMessage(`❌ Failed to fetch video download link.`, event.threadID, event.messageID);
    }

    // Download file to cache
    const fileName = `${Date.now()}_ytvideo.mp4`;
    const filePath = path.join(__dirname, 'cache', fileName);
    const writer = fs.createWriteStream(filePath);

    const videoStream = await axios({
      method: 'GET',
      url: bestMedia.url,
      responseType: 'stream'
    });

    videoStream.data.pipe(writer);

    writer.on('finish', () => {
      const fileSize = fs.statSync(filePath).size;
      if (fileSize > 25 * 1024 * 1024) {
        fs.unlinkSync(filePath);
        return api.sendMessage(`⚠️ The file is too large to send (over 25MB).`, event.threadID, event.messageID);
      }

      const message = {
        body: `🎬 ${result.title}\nDuration: ${duration || 'N/A'} | Quality: ${bestMedia.label || 'Unknown'}`,
        attachment: fs.createReadStream(filePath)
      };

      api.sendMessage(message, event.threadID, () => {
        fs.unlinkSync(filePath);
      }, event.messageID);
    });

    writer.on('error', (err) => {
      console.error('Write error:', err);
      api.sendMessage(`❌ Failed to download video.`, event.threadID, event.messageID);
    });

  } catch (err) {
    console.error('YouTube video error:', err.message);
    api.sendMessage(`❌ An error occurred while processing your request.`, event.threadID, event.messageID);
  }
};