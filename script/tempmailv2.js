const axios = require("axios");

module.exports.config = {
  name: "tempmailv2",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Generate or check temporary emails using Rapido API.",
  usage: "tempmailv2 gen or tempmailv2 inbox <email>",
  credits: "dev",
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  const subcommand = args[0];

  if (!subcommand || (subcommand !== "gen" && subcommand !== "inbox")) {
    return api.sendMessage(
      "Usage:\n• tempmailv2 gen — Generate a temporary email\n• tempmailv2 inbox <email> — Check inbox for given email",
      threadID,
      messageID
    );
  }

  if (subcommand === "gen") {
    try {
      const { data } = await axios.get("https://rapido.zetsu.xyz/api/tempmail/gen");

      if (!data || !data.email) {
        return api.sendMessage(
          "Error: Failed to generate temporary email.",
          threadID,
          messageID
        );
      }

      return api.sendMessage(
        `📧 Email:\n${data.email}\n\n📬 To check inbox, use:\ntempmailv2 inbox ${data.email}`,
        threadID,
        messageID
      );
    } catch (err) {
      console.error("tempmailv2 gen error:", err.message);
      return api.sendMessage(
        "Error: Could not connect to the tempmail API.",
        threadID,
        messageID
      );
    }
  }

  if (subcommand === "inbox") {
    const email = args[1];

    if (!email) {
      return api.sendMessage(
        "Error: Please provide the email address to check.\nExample: tempmailv2 inbox your@email.com",
        threadID,
        messageID
      );
    }

    try {
      const encodedEmail = encodeURIComponent(email);
      const { data } = await axios.get(`https://rapido.zetsu.xyz/api/tempmail/inbox?email=${encodedEmail}`);

      const messages = Object.keys(data)
        .filter(key => key !== "operator")
        .map((key, index) => {
          const msg = data[key];
          return `#${index + 1}\n📧 From: ${msg.from.trim()}\n📬 Subject: ${msg.subject}`;
        });

      if (messages.length === 0) {
        return api.sendMessage(
          `Inbox for ${email} is empty.`,
          threadID,
          messageID
        );
      }

      return api.sendMessage(
        `Inbox for ${email}:\n\n${messages.join("\n\n")}`,
        threadID,
        messageID
      );
    } catch (err) {
      console.error("tempmailv2 inbox error:", err.message);
      return api.sendMessage(
        "Error: Could not retrieve inbox.",
        threadID,
        messageID
      );
    }
  }
};