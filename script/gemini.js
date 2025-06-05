const axios = require('axios');

module.exports.config = {
  name: 'gemini',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['gvision', 'gimage'],
  description: "Analyze question or image using Gemini Vision AI",
  usage: "gemini [question] or reply to an image",
  credits: 'Developer',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const senderId = event.senderID;
  const threadId = event.threadID;
  const messageId = event.messageID;

  const userPrompt = args.join(' ').trim();
  const repliedMessage = event.messageReply?.body || '';
  const finalPrompt = `${repliedMessage} ${userPrompt}`.trim();

  if (!finalPrompt && !event.messageReply?.attachments?.[0]?.url) {
    return api.sendMessage("❌ Provide a question or reply to an image.", threadId, messageId);
  }

  api.sendMessage("⏳ Processing your request using Gemini...", threadId, async (err, info) => {
    if (err) return;

    try {
      let imageUrl = "";

      if (event.messageReply?.attachments?.[0]?.type === 'photo') {
        imageUrl = event.messageReply.attachments[0].url;
      }

      const { data } = await axios.get("https://apis-rho-nine.vercel.app/gemini", {
        params: {
          ask: finalPrompt,
          imagurl: imageUrl
        }
      });

      const result = data.description || "No response returned.";
      const response = `🧠 Gemini Vision\n─────────────\n${result}\n─────────────`;

      api.editMessage(response, info.messageID);
    } catch (error) {
      console.error("Gemini command error:", error);
      api.editMessage(
        "❌ Error: " + (error.response?.data?.message || error.message || "Something went wrong."),
        info.messageID
      );
    }
  });
};