const axios = require("axios");

module.exports.config = {
  name: "advice",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Get a random piece of advice.",
  usage: "advice",
  credits: "developer",
  cooldown: 3,
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  const apiUrl = "https://www.smfahim.xyz/advice";

  try {
    const { data } = await axios.get(apiUrl);

    if (!data || !data.advice) {
      return api.sendMessage("Error: No advice returned.", threadID, messageID);
    }

    return api.sendMessage(`Advice #${data.id}:\n${data.advice}`, threadID, messageID);
  } catch (error) {
    console.error("Advice command error:", error.message);
    return api.sendMessage("Error: Unable to retrieve advice.", threadID, messageID);
  }
};