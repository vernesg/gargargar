module.exports.config = {
    name: 'sim',
    version: '1.0.0',
    role: 0,
    description: "Engage in conversation with an AI bot",
    usage: "sim [prompt]",
    credits: 'Developer',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    const axios = require("axios");
    const input = args.join(" ");

    if (!input) {
        api.sendMessage("Please provide a text prompt. Usage: sim [text]", event.threadID, event.messageID);
        return;
    }
    try {
        const content = encodeURIComponent(input);
        const response = await axios.get(`https://api.simsimi.vn/v1/simtalk?text=${content}`); // Corrected line
        const responseData = response.data;

        if (responseData && responseData.message) { // Use responseData.message instead of responseData.success
            api.sendMessage(responseData.message, event.threadID, event.messageID);
        } else {
            api.sendMessage("An error occurred or the API returned an unexpected response. Please try again later.", event.threadID, event.messageID);
        }
    } catch (error) {
        console.error("Error during API call:", error); // Added error logging
        api.sendMessage("An error occurred while fetching the data.", event.threadID, event.messageID);
    }
};
