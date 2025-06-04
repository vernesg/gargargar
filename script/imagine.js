const axios = require('axios');

module.exports.config = {
  name: "imagine",
  version: "1.0.0",
  credits: "Rized",
  description: "Generates an image based on the provided prompt",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["imagin"],
};

module.exports.run = async function ({ api, event, args }) {
  try {
    let prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage("Please provide a prompt for image generation.", event.threadID, event.messageID);
    }

    api.sendMessage("Generating your image ...", event.threadID, async (err, info) => {
      try {
        const apiUrl = `https://ccprojectsapis.zetsu.xyz/api/generate-art?prompt=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl, { responseType: 'stream' });

        if (!response.data) {
          return api.sendMessage("Failed to retrieve image.", event.threadID, event.messageID);
        }

        return api.sendMessage({
          body: 'Here is your image',
          attachment: response.data,
        }, event.threadID);
      } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while generating your image.", event.threadID);
      }
    });
  } catch (s) {
    api.sendMessage(s.message, event.threadID);
  }
};