const axios = require("axios");

const fontMapping = {
  'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚',
  'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡',
  'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨',
  'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
  'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴',
  'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻',
  'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂',
  'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇'
};

function convertToBold(text) {
  return text.replace(/(?:\*\*(.*?)\*\*|## (.*?)|### (.*?))/g, (match, boldText, h2Text, h3Text) => {
    const targetText = boldText || h2Text || h3Text;
    return [...targetText].map(char => fontMapping[char] || char).join('');
  });
}

module.exports.config = {
  name: 'ai',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['gemini', 'visionai'],
  description: "Answer questions or analyze images using Gemini AI",
  usage: "ai [question] or reply to an image with caption",
  credits: 'Developer',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const input = args.join(" ").trim();
  const senderId = event.senderID;

  if (!input && !event.messageReply?.attachments?.[0]?.url) {
    return api.sendMessage(
      "❌ 𝗣𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝗾𝘂𝗲𝘀𝘁𝗶𝗼𝗻 𝗼𝗿 𝗿𝗲𝗽𝗹𝘆 𝘁𝗼 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲.",
      event.threadID,
      event.messageID
    );
  }

  const waitMsg = "⏳ 𝗣𝗿𝗼𝗰𝗲𝘀𝘀𝗶𝗻𝗴 𝘄𝗶𝘁𝗵 𝗚𝗲𝗺𝗶𝗻𝗶 𝗔𝗜...";
  api.sendMessage(waitMsg, event.threadID, (err, info) => {
    if (err) return;

    (async () => {
      try {
        let imageUrl = "";

        if (event.messageReply?.attachments?.[0]?.type === 'photo') {
          imageUrl = event.messageReply.attachments[0].url;
        }

        const { data } = await axios.get("https://kaiz-apis.gleeze.com/api/gemini-vision", {
          params: {
            ask: input || "",
            imagurl: imageUrl || ""
          }
        });

        const result = convertToBold(data.description || "No description returned.");

        const responseMessage = `
AI ASSISTANT 
─────────────
${result}
─────────────`;

        if (responseMessage.length > 2000) {
          const chunks = splitMessageIntoChunks(responseMessage, 2000);
          for (const chunk of chunks) {
            await new Promise(resolve => setTimeout(resolve, 500));
            api.sendMessage(chunk, event.threadID);
          }
        } else {
          api.editMessage(responseMessage, info.messageID);
        }
      } catch (err) {
        console.error("AI Error:", err.message || err);
        api.editMessage("❌ Error: " + (err.message || "Something went wrong."), info.messageID);
      }
    })();
  });
};

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}
