const axios = require('axios');

module.exports.config = {
  name: 'humanizer',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['humanize', 'textfix'],
  description: "Humanize AI-generated text",
  usage: "humanizer [AI-generated text]",
  credits: 'Developer',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const input = args.join(' ');

  if (!input) {
    api.sendMessage(
      "Please provide AI-generated text after 'humanizer'. Example: 'humanizer Your AI-generated text here.'",
      event.threadID,
      event.messageID
    );
    return;
  }

  api.sendMessage(
    "Processing your request, please wait...",
    event.threadID,
    (err, info) => {
      if (err) return;

      axios
        .get(`https://kaiz-apis.gleeze.com/api/humanizer?q=${encodeURIComponent(input)}&apikey=bbcc44b9-4710-41c7-8034-fa2000ea7ae5`)
        .then(({ data }) => {
          const response = data.response;

          const parts = [];
          for (let i = 0; i < response.length; i += 1999) {
            parts.push(response.substring(i, i + 1999));
          }

          // Send the response in parts if it exceeds the limit
          (async () => {
            for (const part of parts) {
              await api.sendMessage(part, event.threadID);
            }
          })();
        })
        .catch(() => {
          api.editMessage(
            "An error occurred while processing your request.",
            info.messageID
          );
        });
    }
  );
};