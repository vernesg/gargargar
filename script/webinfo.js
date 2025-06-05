const axios = require("axios");

module.exports.config = {
  name: "webinfo",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: "Fetch metadata from a given website URL",
  usage: "webinfo <website url>",
  credits: "developer",
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (args.length === 0) {
    return api.sendMessage(
      "Error: Please provide a website URL.\nExample: webinfo https://vercel.com",
      threadID,
      messageID
    );
  }

  const siteUrl = args.join(" ").trim();
  const apiUrl = `https://jonell01-ccprojectsapihshs.hf.space/api/webinfo?url=${encodeURIComponent(siteUrl)}`;

  try {
    const { data } = await axios.get(apiUrl);

    const message =
      `Website Info:\n\n` +
      `URL: ${data.url}\n` +
      `Title: ${data.title}\n` +
      `Site Name: ${data.siteName}\n` +
      `Description: ${data.description || "No description provided."}`;

    return api.sendMessage(message, threadID, messageID);
  } catch (error) {
    console.error("webinfo command error:", error.message);
    return api.sendMessage(
      "Error: Failed to fetch website info.",
      threadID,
      messageID
    );
  }
};