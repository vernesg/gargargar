module.exports.config = {
    name: "zuck",
    version: "1.0.0",
    role: 0,
    credits: "Rized",  // Credit name set to Rized
    description: "Generate a Zuck-style image",
    hasPrefix: false,
    aliases: ["zuck"],
    usage: "[zuck <text>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        // Join arguments into a single string with spaces preserved
        const text = args.join(" ");

        // Check if the text is provided
        if (!text) {
            api.sendMessage("Usage: zuck <text>", event.threadID);
            return;
        }

        // Construct the API URL with properly encoded parameters
        const encodedText = encodeURIComponent(text);
        const url = `https://jerome-web.onrender.com/service/api/zuck?text=${encodedText}`;
        const imagePath = path.join(__dirname, "zuck_image.png");

        // Notify the user that the image is being generated
        api.sendMessage("Generating your Zuck-style image, please wait...", event.threadID);

        // Fetch the image from the API
        const response = await axios({
            url: url,
            method: 'GET',
            responseType: 'stream'
        });

        // Create a writable stream to save the image
        const writer = fs.createWriteStream(imagePath);
        response.data.pipe(writer);

        // Handle the finish event of the writable stream
        writer.on('finish', async () => {
            try {
                // Send the image as an attachment
                await api.sendMessage({
                    attachment: fs.createReadStream(imagePath)
                }, event.threadID);

                // Clean up the file after sending
                fs.unlinkSync(imagePath);
            } catch (sendError) {
                console.error('Error sending image:', sendError);
                api.sendMessage("An error occurred while sending the image.", event.threadID);
            }
        });

        // Handle errors during the writing process
        writer.on('error', (err) => {
            console.error('Stream writer error:', err);
            api.sendMessage("An error occurred while processing the request.", event.threadID);
        });
    } catch (error) {
        console.error('Error:', error);
        api.sendMessage("An error occurred while processing the request.", event.threadID);
    }
};