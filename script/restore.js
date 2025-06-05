const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "restore",
  version: "1.0.0",
  role: 0,
  credits: "developer",
  aliases: [],
  usages: "<reply to image>",
  cooldown: 5,
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, messageReply } = event;

  // Check if user replied to an image
  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("❌ Please reply to an image first.", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage("❌ The replied message must be a photo.", threadID, messageID);
  }

  const imageUrl = attachment.url;
  const tempPath = path.join(__dirname, 'cache', `restore_${Date.now()}.jpg`);
  const apiUrl = `https://rapido.zetsu.xyz/api/restore?imageUrl=${encodeURIComponent(imageUrl)}`;

  try {
    api.sendMessage("⌛ Restoring image, please wait...", threadID, messageID);

    // Download the restored image as arraybuffer
    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

    // Ensure cache folder exists and save the image
    fs.ensureDirSync(path.dirname(tempPath));
    fs.writeFileSync(tempPath, Buffer.from(response.data, "binary"));

    // Send the restored image back and clean temp file
    api.sendMessage({
      body: "✅ Here is your restored image!",
      attachment: fs.createReadStream(tempPath)
    }, threadID, () => fs.unlinkSync(tempPath), messageID);

  } catch (error) {
    console.error("Error restoring image:", error);
    api.sendMessage("❌ An error occurred while restoring the image. Please try again later.", threadID, messageID);
  }
};