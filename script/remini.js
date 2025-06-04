const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "remini",
  version: "1.0.0",
  role: 0,
  credits: "Ry",
  aliases: [],
  usages: "< reply to image >",
  cooldown: 5,
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, messageReply } = event;
  const tempPath = path.join(__dirname, 'cache', `remini_${Date.now()}.jpg`);

  // Check if the user replied to an image
  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("❌ Please reply to an image.", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage("❌ The replied message must be a photo.", threadID, messageID);
  }

  const imageUrl = attachment.url;
  const apiUrl = `https://kaiz-apis.gleeze.com/api/remini?url=${encodeURIComponent(imageUrl)}&stream=true&apikey=bbcc44b9-4710-41c7-8034-fa2000ea7ae5`;

  try {
    api.sendMessage("⏳ Enhancing image, please wait...", threadID, messageID);

    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    // Ensure cache directory exists
    fs.ensureDirSync(path.dirname(tempPath));
    fs.writeFileSync(tempPath, Buffer.from(response.data, "binary"));

    api.sendMessage({
      body: "✅ Image enhanced!",
      attachment: fs.createReadStream(tempPath)
    }, threadID, () => fs.unlinkSync(tempPath), messageID);

  } catch (err) {
    console.error("Remini Error:", err.message);
    api.sendMessage("❌ Error occurred while enhancing the image.", threadID, messageID);
  }
};