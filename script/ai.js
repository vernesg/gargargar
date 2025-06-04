const axios = require('axios');

module.exports.config = {
  name: 'ai',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['gpt4', 'gpt'],
  description: "question and recognition AI",
  usage: "ai3 [description] or reply to an image",
  credits: 'Developer',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const input = args.join(' ').trim();
  const senderId = event.senderID;

  if (!input && !event.messageReply?.attachments?.[0]?.url) {
    api.sendMessage(
      "❌ Provide question or reply to an image for recognition.",
      event.threadID,
      event.messageID
    );
    return;
  }

  const waitingMessage = "⌛ Processing your request, please wait...";
  api.sendMessage(waitingMessage, event.threadID, (err, info) => {
    if (err) return;

    (async () => {
      try {
        let imageUrl = "";

        if (event.messageReply?.attachments?.[0]?.type === 'photo') {
          imageUrl = event.messageReply.attachments[0].url;
        }

        const apiUrl = "https://kaiz-apis.gleeze.com/api/gpt-4o-pro";
        const { data } = await axios.get(apiUrl, {
          params: {
            ask: input || "",
            uid: senderId,
            imageUrl: imageUrl || "",
            apikey: "bbcc44b9-4710-41c7-8034-fa2000ea7ae5"
          }
        });

        const result = data.response;

        api.editMessage(result, info.messageID);
      } catch (error) {
        console.error("Error in AI command:", error);
        api.editMessage(
          "❌ Error: " + (error.message || "Something went wrong."),
          info.messageID
        );
      }
    })();
  });
};