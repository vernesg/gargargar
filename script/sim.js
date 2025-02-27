/**
 * @file sim.js
 * @description A command module that interacts with an AI chatbot API.
 * @version 1.1.0
 * @author Developer
 */

module.exports.config = {
    name: 'sim',
    version: '1.1.0',
    role: 0,
    description: "Engage in conversation with an AI bot. You can specify a language. Example: sim en Hello",
    usage: "sim [lang] [prompt]",
    credits: 'Developer',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    const axios = require("axios");
    let lang = "en"; // Default language is English
    let input = args.join(" ");

    // Check if a language code is provided (e.g., "en", "es", "fr")
    if (args.length > 1 && args[0].length === 2) {
        lang = args.shift(); // Extract the language code from the arguments
        input = args.join(" "); // Reconstruct the input string without the language code
    }

    // Validate if the user provided any input text
    if (!input) {
        api.sendMessage("Please provide a text prompt. Usage: sim [lang] [text]", event.threadID, event.messageID);
        return;
    }

    try {
        // Encode the user's input for use in the API URL
        const content = encodeURIComponent(input);

        // Send a GET request to the SimSimi API
        const response = await axios.get(`https://simsimi.fun/api/v2/?mode=talk&lang=${lang}&message=${content}&filter=false`);
        const responseData = response.data;

        // Check if the API returned an error
        if (responseData.error) {
            api.sendMessage(`An error occurred: ${responseData.error}. Please try again later.`, event.threadID, event.messageID);
        } else {
            // Send the API's successful response to the chat
            api.sendMessage(responseData.success, event.threadID, event.messageID);
        }
    } catch (error) {
        // Handle any errors that occurred during the API request
        console.error("Sim command error:", error); // Log the error for debugging
        api.sendMessage("An error occurred while fetching the data. Please check the console for details.", event.threadID, event.messageID);
    }
};
