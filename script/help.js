module.exports.config = {
  name: "help",
  version: "3.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["info", "commands"],
  description: "Displays a list of available commands with navigation buttons",
  usage: "help [command]",
  credits: "Developer",
};

module.exports.run = async function ({ api, event, enableCommands, args, Utils, prefix }) {
  try {
    const commands = enableCommands[0].commands || [];
    const eventCommands = enableCommands[1]?.handleEvent || [];
    const pageSize = 10;
    const totalPages = Math.ceil(commands.length / pageSize);
    let page = 1;

    if (!isNaN(args[0])) {
      page = Math.max(1, Math.min(parseInt(args[0]), totalPages));
    }

    return sendHelpPage(page, event.threadID, event.messageID);

    // Function: Send Help Page with Buttons
    function sendHelpPage(page, threadID, messageID) {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      let helpMessage = `🎩 𝗕𝗢𝗧 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 🎩\n\n`;

      for (let i = start; i < Math.min(end, commands.length); i++) {
        helpMessage += `🔹 *${i + 1}.* ${prefix}${commands[i]}\n`;
      }

      if (eventCommands.length) {
        helpMessage += `\n🎭 𝗘𝗩𝗘𝗡𝗧 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 🎭\n`;
        eventCommands.forEach((cmd, index) => {
          helpMessage += `🔸 *${index + 1}.* ${prefix}${cmd}\n`;
        });
      }

      helpMessage += `\n📜 *Page ${page}/${totalPages}*`;

      // Create Buttons
      const buttons = [];
      if (page > 1) buttons.push({ label: "⬅️ Prev", type: "postback", payload: `help_page_${page - 1}` });
      if (page < totalPages) buttons.push({ label: "➡️ Next", type: "postback", payload: `help_page_${page + 1}` });

      return api.sendMessage(
        { body: helpMessage, attachment: null, buttons },
        threadID,
        messageID
      );
    }
  } catch (error) {
    console.error("Error in help command:", error);
    api.sendMessage("⚠️ An error occurred while processing the request.", event.threadID, event.messageID);
  }
};

// Handle Pagination Button Clicks
module.exports.handleEvent = async function ({ api, event }) {
  const { body, threadID, messageID } = event;
  if (body?.startsWith("help_page_")) {
    const page = parseInt(body.split("_")[2]);
    return module.exports.run({ api, event: { threadID, messageID, args: [page] }, enableCommands });
  }
};
