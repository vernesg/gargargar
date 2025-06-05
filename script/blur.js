const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "blur",
  version: "1.0.0",
  role: 0,
  credits: "dev",
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
  const tempPath = path.join(__dirname, 'cache', `blur_${Date.now()}.jpg`);
  const apiUrl = `https://api.popcat.xyz/v2/blur?image=${encodeURIComponent(imageUrl)}`;

  try {
    api.sendMessage("⌛ Applying blur effect, please wait...", threadID, messageID);

    // Download the blurred image as arraybuffer
    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

    // Ensure cache folder exists and save the image
    fs.ensureDirSync(path.dirname(tempPath));
    fs.writeFileSync(tempPath, Buffer.from(response.data, "binary"));

    // Send the blurred image back and clean temp file
    api.sendMessage({
      body: "✅ Here is your blurred image!",
      attachment: fs.createReadStream(tempPath)
    }, threadID, () => fs.unlinkSync(tempPath), messageID);

  } catch (error) {
    console.error("Error applying blur effect:", error);
    api.sendMessage("❌ An error occurred while applying the blur. Please try again later.", threadID, messageID);
  }
};