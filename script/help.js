module.exports.config = {
  name: "help",
  version: "3.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["info"],
  description: "View all available commands or get details about a specific command.",
  usage: "help [page] | help [command] | help search [keyword]",
  credits: "Developer",
};

module.exports.run = async function({ api, event, enableCommands, args, Utils, prefix }) {
  try {
    const commands = enableCommands[0]?.commands || [];
    const eventCommands = enableCommands[1]?.handleEvent || [];
    const input = args.join(" ").toLowerCase();
    const perPage = 10;
    const totalPages = Math.max(1, Math.ceil(commands.length / perPage));

    if (!input) return sendHelpPage(api, event, prefix, commands, eventCommands, 1, totalPages, perPage);

    if (!isNaN(input)) {
      const page = parseInt(input);
      if (page < 1 || page > totalPages) return api.sendMessage(`⚠️ Invalid page! Only ${totalPages} pages available.`, event.threadID, event.messageID);
      return sendHelpPage(api, event, prefix, commands, eventCommands, page, totalPages, perPage);
    }

    if (input.startsWith("search ")) {
      const keyword = input.replace("search ", "").trim();
      return searchCommands(api, event, prefix, commands, keyword);
    }

    const command = commands.find(cmd => cmd.toLowerCase() === input);
    if (command) return sendCommandDetails(api, event, command, Utils);

    return api.sendMessage(`❌ Command '${input}' not found! Try **${prefix}help search [keyword]**`, event.threadID, event.messageID);
  } catch (error) {
    console.error(error);
    return api.sendMessage(`❌ An error occurred while processing the help command.`, event.threadID, event.messageID);
  }
};

// Function to send paginated help list with numbering
function sendHelpPage(api, event, prefix, commands, eventCommands, page, totalPages, perPage) {
  const start = (page - 1) * perPage;
  const end = Math.min(start + perPage, commands.length);
  let message = `📜 **COMMAND LIST (Page ${page}/${totalPages})** 📜\n\n`;

  for (let i = start; i < end; i++) {
    message += `${i + 1}. 🔹 ${prefix}${commands[i]}\n`;
  }

  if (eventCommands.length > 0) {
    message += `\n⚡ **EVENT COMMANDS** ⚡\n`;
    eventCommands.forEach((eventCmd, index) => {
      message += `${index + 1 + end}. 🔸 ${prefix}${eventCmd}\n`;
    });
  }

  message += `\n➡️ Use: **${prefix}help [page]** to navigate.\n📌 Use: **${prefix}help [command]** for details.\n🔍 Search: **${prefix}help search [keyword]**`;

  api.sendMessage({ body: message, quick_replies: getPaginationButtons(page, totalPages) }, event.threadID, event.messageID);
}

// Function to send command details
function sendCommandDetails(api, event, command, Utils) {
  const commandDetails = Utils.commands.find(cmd => cmd.name.toLowerCase() === command.toLowerCase());
  if (!commandDetails) return api.sendMessage(`❌ Command details not found for '${command}'.`, event.threadID, event.messageID);

  const { name, version, role, aliases = [], description, usage, credits, cooldown } = commandDetails;
  const roleMessage = role === 0 ? "👥 User" : role === 1 ? "🔧 Admin" : role === 2 ? "👑 Thread Admin" : role === 3 ? "🌟 Super Admin" : "Unknown";
  const aliasesMessage = aliases.length ? `📌 Aliases: ${aliases.join(", ")}\n` : "";

  const message = `🔎 **COMMAND DETAILS** 🔎\n\n📌 **Name:** ${name}\n📌 **Version:** ${version || "N/A"}\n📌 **Role:** ${roleMessage}\n${aliasesMessage}📌 **Description:** ${description || "No description available"}\n📌 **Usage:** ${usage || "No usage info"}\n📌 **Credits:** ${credits || "Unknown"}\n📌 **Cooldown:** ${cooldown ? `${cooldown} seconds` : "None"}\n`;

  api.sendMessage(message, event.threadID, event.messageID);
}

// Function to search commands by keyword
function searchCommands(api, event, prefix, commands, keyword) {
  const foundCommands = commands.filter(cmd => cmd.toLowerCase().includes(keyword.toLowerCase()));
  if (foundCommands.length === 0) return api.sendMessage(`❌ No commands found for '${keyword}'!`, event.threadID, event.messageID);

  let message = `🔍 **SEARCH RESULTS FOR '${keyword}'** 🔍\n\n`;
  foundCommands.forEach((cmd, index) => message += `${index + 1}. 🔹 ${prefix}${cmd}\n`);
  message += `\n📌 Use **${prefix}help [command]** for details.`;

  api.sendMessage(message, event.threadID, event.messageID);
}

// Function to get pagination buttons
function getPaginationButtons(currentPage, totalPages) {
  let buttons = [];
  if (currentPage > 1) buttons.push({ content_type: "text", title: "⬅️ Prev", payload: `help ${currentPage - 1}` });
  if (currentPage < totalPages) buttons.push({ content_type: "text", title: "➡️ Next", payload: `help ${currentPage + 1}` });
  return buttons;
}

// Handle event to check bot prefix
module.exports.handleEvent = async function({ api, event, prefix }) {
  const { threadID, messageID, body } = event;
  if (body?.toLowerCase().startsWith("prefix")) api.sendMessage(`🙃 **System Prefix:** ${prefix}`, threadID, messageID);
};
