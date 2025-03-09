module.exports.config = {
  name: "help",
  version: "2.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["info"],
  description: "View available commands or get details about a specific command.",
  usage: "help [page] | help [command]",
  credits: "Developer",
};

module.exports.run = async function({ api, event, enableCommands, args, Utils, prefix }) {
  try {
    const commands = enableCommands[0]?.commands || [];
    const eventCommands = enableCommands[1]?.handleEvent || [];
    const input = args.join(" ").toLowerCase();
    const perPage = 10;
    const totalPages = Math.ceil(commands.length / perPage);

    // If no input, show first page
    if (!input) {
      return sendHelpPage(api, event, prefix, commands, eventCommands, 1, totalPages, perPage);
    }

    // If input is a number, show that page
    if (!isNaN(input)) {
      const page = parseInt(input);
      if (page < 1 || page > totalPages) {
        return api.sendMessage(`⚠️ Invalid page! Only ${totalPages} pages available.`, event.threadID, event.messageID);
      }
      return sendHelpPage(api, event, prefix, commands, eventCommands, page, totalPages, perPage);
    }

    // If input is a command name, show command details
    const command = commands.find(cmd => cmd.toLowerCase() === input);
    if (command) {
      return sendCommandDetails(api, event, command, Utils);
    }

    // If input doesn't match any command
    return api.sendMessage(`❌ Command '${input}' not found!`, event.threadID, event.messageID);
  } catch (error) {
    console.error(error);
    return api.sendMessage(`❌ An error occurred while processing the help command.`, event.threadID, event.messageID);
  }
};

// Function to send paginated help list
function sendHelpPage(api, event, prefix, commands, eventCommands, page, totalPages, perPage) {
  const start = (page - 1) * perPage;
  const end = Math.min(start + perPage, commands.length);

  let message = `📜 **COMMAND LIST (Page ${page}/${totalPages})** 📜\n\n`;

  for (let i = start; i < end; i++) {
    message += `🔹 ${prefix}${commands[i]}\n`;
  }

  if (eventCommands.length > 0) {
    message += `\n⚡ **EVENT COMMANDS** ⚡\n`;
    eventCommands.forEach(eventCmd => {
      message += `🔸 ${prefix}${eventCmd}\n`;
    });
  }

  message += `\n➡️ Use: **${prefix}help [page number]** to view another page.\n📌 Use: **${prefix}help [command]** for details.`;

  api.sendMessage(message, event.threadID, event.messageID);
}

// Function to send command details
function sendCommandDetails(api, event, command, Utils) {
  const commandDetails = Utils.commands.find(cmd => cmd.name.toLowerCase() === command.toLowerCase());

  if (!commandDetails) {
    return api.sendMessage(`❌ Command details not found for '${command}'.`, event.threadID, event.messageID);
  }

  const { name, version, role, aliases = [], description, usage, credits, cooldown } = commandDetails;

  const roleMessage = role === 0 ? "👥 User" : role === 1 ? "🔧 Admin" : role === 2 ? "👑 Thread Admin" : role === 3 ? "🌟 Super Admin" : "Unknown";
  const aliasesMessage = aliases.length ? `📌 Aliases: ${aliases.join(", ")}\n` : "";

  const message = `🔎 **COMMAND DETAILS** 🔎\n\n` +
    `📌 **Name:** ${name}\n` +
    `📌 **Version:** ${version || "N/A"}\n` +
    `📌 **Role:** ${roleMessage}\n` +
    `${aliasesMessage}` +
    `📌 **Description:** ${description || "No description available"}\n` +
    `📌 **Usage:** ${usage || "No usage info"}\n` +
    `📌 **Credits:** ${credits || "Unknown"}\n` +
    `📌 **Cooldown:** ${cooldown ? `${cooldown} seconds` : "None"}\n`;

  api.sendMessage(message, event.threadID, event.messageID);
}

// Handle event to check bot prefix
module.exports.handleEvent = async function({ api, event, prefix }) {
  const { threadID, messageID, body } = event;

  if (body?.toLowerCase().startsWith("prefix")) {
    api.sendMessage(`🙃 **System Prefix:** ${prefix}`, threadID, messageID);
  }
};
