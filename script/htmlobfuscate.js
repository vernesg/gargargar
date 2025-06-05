const axios = require('axios');

module.exports.config = {
  name: "htmlobfuscate",
  version: "1.0.0",
  credits: "developer",
  description: "Obfuscates raw HTML code via API.",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["htmlobf", "obfuscatehtml"],
};

module.exports.run = async function ({ api, event, args }) {
  try {
    let htmlCode = args.join(" ");
    if (!htmlCode) {
      return api.sendMessage("Usage: htmlobfuscate <raw_html_code>", event.threadID, event.messageID);
    }

    api.sendMessage("Obfuscating your HTML code...", event.threadID, async () => {
      try {
        const encodedCode = encodeURIComponent(htmlCode);
        const apiUrl = `https://kaiz-apis.gleeze.com/api/html-obfuscator?code=${encodedCode}&apikey=bbcc44b9-4710-41c7-8034-fa2000ea7ae5`;

        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.obfuscated_code) {
          return api.sendMessage("Failed to get obfuscated code from API.", event.threadID, event.messageID);
        }

        const message = `Obfuscated Code:\n${data.obfuscated_code}`;
        api.sendMessage(message, event.threadID);
      } catch (error) {
        console.error("htmlobfuscate error:", error);
        api.sendMessage("Error: Failed to obfuscate HTML code.", event.threadID, event.messageID);
      }
    });
  } catch (e) {
    api.sendMessage(e.message, event.threadID, event.messageID);
  }
};