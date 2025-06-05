const axios = require('axios');

module.exports.config = {
  name: "hentaigif",
  version: "1.0.0",
  credits: "developer",
  description: "Fetches a random Hentai GIF.",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["hgif"],
};

module.exports.run = async function ({ api, event, args }) {
  try {
    api.sendMessage("🔞 Fetching a random Hentai GIF...", event.threadID, async () => {
      try {
        const API_URL = 'https://kaiz-apis.gleeze.com/api/hentaigif';
        const API_KEY = '8062a9eb-2a2e-458b-a1f0-4cd25de8b000';

        const res = await axios.get(API_URL, {
          params: { apikey: API_KEY }
        });

        const gifs = res.data.gifs;

        if (!gifs || gifs.length === 0) {
          return api.sendMessage("❌ No Hentai GIFs found.", event.threadID, event.messageID);
        }

        const randomGifUrl = gifs[Math.floor(Math.random() * gifs.length)];
        const stream = await axios.get(randomGifUrl, { responseType: 'stream' });

        return api.sendMessage({
          body: "Here you go 💦",
          attachment: stream.data
        }, event.threadID);
      } catch (err) {
        console.error("HentaiGIF Error:", err);
        return api.sendMessage("❌ Failed to retrieve Hentai GIF.", event.threadID, event.messageID);
      }
    });
  } catch (e) {
    api.sendMessage(e.message, event.threadID, event.messageID);
  }
};