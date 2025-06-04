const axios = require('axios');

module.exports.config = {
  name: "flux",
  version: "1.0.0",
  credits: "developer",
  description: "Generates an AI image using the Flux model based on the provided prompt.",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["fluximage"],
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage(
        "Please provide a prompt to generate a Flux image.\n\nExample: flux cat",
        event.threadID,
        event.messageID
      );
    }

    api.sendMessage("Generating your Flux image, please wait...", event.threadID, async () => {
      try {
        const apiUrl = `https://kaiz-apis.gleeze.com/api/flux?prompt=${encodeURIComponent(prompt)}&apikey=52c32711-e257-448e-b96d-06d86f77e6a4`;
        const response = await axios.get(apiUrl, { responseType: "stream" });

        if (!response.data) {
          return api.sendMessage("Failed to retrieve the image.", event.threadID, event.messageID);
        }

        return api.sendMessage({
          body: "Here is your image:",
          attachment: response.data,
        }, event.threadID);
      } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while generating your image.", event.threadID);
      }
    });
  } catch (err) {
    api.sendMessage(err.message, event.threadID);
  }
};