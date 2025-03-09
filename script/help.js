module.exports.config = {
  name: "help",
  version: "3.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["info"],
  description: "View available commands, search for a command, or get details.",
  usage: "help [page] | help [command] | help search [keyword] | help bookmark",
  credits: "Developer",
};

const userBookmarks = {}; // Store user-specific bookmarked commands

module.exports.run = async function({ api, event, enableCommands, args, Utils, prefix }) {
  try {
    const commands = enableCommands[0]?.commands || [];
    const eventCommands = enableCommands[1]?.handleEvent || [];
    const input = args.join(" ").toLowerCase();
    const perPage = 5;
    const userID = event.senderID;
    
    // Categorizing commands
    const categories = {
      "Moderation": ["ban", "unban", "kick"],
      "Fun": ["joke", "meme", "quote"],
      "Utilities": ["help", "ping", "userinfo"]
    };

    const sendInDM = (message, buttons) => {
      api.sendMessage({
        body: message,
        attachment: buttons
      }, userID, (err) => {
        if (err) {
          api.sendMessage("⚠️ Unable to send DM. Please check your settings!", event.threadID, event.messageID);
        } else {
          api.sendMessage("✅ Check your DMs for the help message!", event.threadID, event.messageID);
        }
      });
    };

    if (!input) {
      return sendHelpPage(api, event, prefix, commands, categories, eventCommands, 1, perPage, sendInDM);
    }

    if (!isNaN(input)) {
      const page = parseInt(input);
      return sendHelpPage(api, event, prefix, commands, categories, eventCommands, page, perPage, sendInDM);
    }

    if (input.startsWith("search ")) {
      const searchTerm = input.replace("search ", "").trim();
      return searchCommands(api, event, searchTerm, commands, sendInDM);
    }

    if (input === "bookmark") {
      return showBookmarks(api, event, userID, sendInDM);
    }

    if (input.startsWith("bookmark ")) {
      const commandToBookmark = input.replace("bookmark ", "").trim();
      return bookmarkCommand(api, event, userID, commandToBookmark);
    }

    const command = commands.find(cmd => cmd.toLowerCase() === input);
    if (command) {
      return sendCommandDetails(api, event, command, Utils, sendInDM);
    }

    return api.sendMessage(`❌ Command '${input}' not found! Try '!help search [keyword]'.`, event.threadID, event.messageID);
  } catch (error) {
    console.error(error);
    return api.sendMessage(`❌ An error occurred while processing the help command.`, event.threadID, event.messageID);
  }
};

// Function to send categorized help page
function sendHelpPage(api, event, prefix, commands, categories, eventCommands, page, perPage, sendInDM) {
  const totalPages = Math.ceil(Object.keys(categories).length / perPage);
  const start = (page - 1) * perPage;
  const end = Math.min(start + perPage, Object.keys(categories).length);
  let message = `📜 **COMMAND LIST (Page ${page}/${totalPages})** 📜\n\n`;

  Object.keys(categories).slice(start, end).forEach(category => {
    message += `🔹 **${category} Commands:**\n`;
    categories[category].forEach(cmd => {
      message += `  - ${prefix}${cmd}\n`;
    });
    message += "\n";
  });

  message += `➡️ Use: **${prefix}help [page number]** to view more.\n📌 Use: **${prefix}help [command]** for details.\n🔍 Use: **${prefix}help search [keyword]** to search.\n⭐ Use: **${prefix}help bookmark** to view saved commands.`;

  const buttons = [
    { type: "postback", title: "⬅️ Previous", payload: `help_page_${page - 1}` },
    { type: "postback", title: "➡️ Next", payload: `help_page_${page + 1}` }
  ];

  sendInDM(message, buttons);
}

// Function to search commands
function searchCommands(api, event, searchTerm, commands, sendInDM) {
  const matchedCommands = commands.filter(cmd => cmd.toLowerCase().includes(searchTerm));
  if (matchedCommands.length === 0) {
    return api.sendMessage(`❌ No commands found matching '${searchTerm}'.`, event.threadID, event.messageID);
  }

  let message = `🔍 **Search Results for '${searchTerm}':**\n\n`;
  matchedCommands.forEach(cmd => {
    message += `🔹 ${cmd}\n`;
  });

  sendInDM(message);
}

// Function to send command details
function sendCommandDetails(api, event, command, Utils, sendInDM) {
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

  sendInDM(message);
}

// Function to bookmark a command
function bookmarkCommand(api, event, userID, command) {
  if (!userBookmarks[userID]) userBookmarks[userID] = [];
  if (!userBookmarks[userID].includes(command)) {
    userBookmarks[userID].push(command);
    return api.sendMessage(`✅ Command '${command}' has been bookmarked!`, event.threadID, event.messageID);
  }
  return api.sendMessage(`⚠️ Command '${command}' is already bookmarked!`, event.threadID, event.messageID);
}

// Function to show user's bookmarks
function showBookmarks(api, event, userID, sendInDM) {
  if (!userBookmarks[userID] || userBookmarks[userID].length === 0) {
    return api.sendMessage(`❌ You have no bookmarked commands. Use '!help bookmark [command]' to save one.`, event.threadID, event.messageID);
  }

  let message = `⭐ **Your Bookmarked Commands:**\n\n`;
  userBookmarks[userID].forEach(cmd => {
    message += `🔹 ${cmd}\n`;
  });

  sendInDM(message);
}
