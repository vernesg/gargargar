module.exports.config = {
    name: "xavier",
    version: "1.0.0",
    role: 0,
    credits: "Rized",
    description: "Generate a Xavier-style image",
    hasPrefix: false,
    aliases: ["xavier"],
    usage: "[xavier <text>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        const text = args.join(" ");
        if (!text) {
            api.sendMessage("Usage: xavier <text>", event.threadID);
            return;
        }

        const encodedText = encodeURIComponent(text);
        const url = `https://jerome-web.onrender.com/service/api/xavier?text=${encodedText}`;
        const imagePath = path.join(__dirname, "xavier_image.png");

        api.sendMessage("Generating your Xavier-style image, please wait...", event.threadID);

        const response = await axios({
            url: url,
            method: 'GET',
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(imagePath);
        response.data.pipe(writer);

        writer.on('finish', async () => {
            try {
                await api.sendMessage({
                    attachment: fs.createReadStream(imagePath)
                }, event.threadID);

                fs.unlinkSync(imagePath);
            } catch (sendError) {
                console.error('Error sending image:', sendError);
                api.sendMessage("An error occurred while sending the image.", event.threadID);
            }
        });

        writer.on('error', (err) => {
            console.error('Stream writer error:', err);
            api.sendMessage("An error occurred while processing the request.", event.threadID);
        });
    } catch (error) {
        console.error('Error:', error);
        api.sendMessage("An error occurred while processing the request.", event.threadID);
    }
};