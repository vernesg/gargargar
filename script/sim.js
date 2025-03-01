const fs = require('fs');

module.exports.config = {
    name: 'customsim',
    version: '1.1.0', // Increased version for clarity
    role: 0,
    description: "Provides custom responses from a JSON file.",
    usage: "customsim [prompt]",
    credits: 'Customized by You',
    cooldown: 3,
    dependencies: {
        "fs": "" // Explicitly mentioning dependency (optional, but good practice)
    }
};

module.exports.run = async function({ api, event, args }) {
    const input = args.join(" ").toLowerCase().trim(); // Trim for robustness

    if (!input) {
        api.sendMessage({
            body: "Please provide a text prompt. Usage: customsim [text]",
            mentions: [],
        }, event.threadID, event.messageID);
        return;
    }

    try {
        const responses = JSON.parse(fs.readFileSync('.script/cache/responses.json', 'utf8'));
        const response = responses[input];

        if (response) {
            api.sendMessage({
                body: response,
                mentions: [],
            }, event.threadID, event.messageID);
        } else {
            api.sendMessage({
                body: "Sorry, I don't have a response for that.",
                mentions: [],
            }, event.threadID, event.messageID);
        }
    } catch (error) {
        console.error("Error in customsim:", error); // Log the error for debugging
        api.sendMessage({
            body: "An error occurred while processing your request. Please try again later.",
            mentions: [],
        }, event.threadID, event.messageID);
    }
};

// Example responses.json file (place in the same directory as customsim.js)
// {
//   "hi": "Hello! How are you?",
//   "hello": "Greetings!",
//   "how are you": "I'm doing well, thank you!",
//   "what is your name": "I'm a custom bot.",
//   "goodbye": "Goodbye! Have a nice day."
// }