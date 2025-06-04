const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

module.exports.config = {
    name: "instadl",
    version: "1.0.0",
    permission: 0,
    description: "Download Instagram reel video",
    prefix: false,
    premium: false,
    credits: "developer",
    cooldowns: 10,
    category: "media"
};

module.exports.run = async function ({ api, event, args }) {
    const messageText = args.join(' ');
    const instagramLinkRegex = /https:\/\/www\.instagram\.com\/\S+/;

    if (!instagramLinkRegex.test(messageText)) {
        return api.sendMessage("❌ Please provide a valid Instagram reel link.", event.threadID, event.messageID);
    }

    try {
        api.sendMessage("📥 𝖣𝗈𝗐𝗇𝗅𝗈𝖺𝖽𝗂𝗇𝗀 𝖨𝗇𝗌𝗍𝖺𝗀𝗋𝖺𝗆 𝗏𝗂𝖽𝖾𝗈, 𝗉𝗅𝖾𝖺𝗌𝖾 𝗐𝖺𝗂𝗍...", event.threadID, event.messageID);

        const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/instadl?url=${encodeURIComponent(messageText)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.status || !data.result || data.result.length === 0) {
            throw new Error("Invalid API response");
        }

        const video = data.result.find(r => r.type === 'video');
        if (!video || !video.url) {
            throw new Error("No downloadable video found");
        }

        const headResponse = await axios.head(video.url);
        const fileSize = parseInt(headResponse.headers['content-length'], 10);

        if (fileSize > 25 * 1024 * 1024) {
            return api.sendMessage({
                body: "⚠️ The video is larger than 25MB and cannot be sent directly.\n\nClick the button below to watch it.",
                attachment: null,
                buttons: [
                    {
                        type: "web_url",
                        url: video.url,
                        title: "Watch Video"
                    }
                ]
            }, event.threadID, event.messageID);
        }

        const fileName = `${event.messageID}.mp4`;
        const filePath = path.join(__dirname, fileName);

        const videoStream = await axios({
            method: 'GET',
            url: video.url,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        videoStream.data.pipe(writer);

        writer.on('finish', () => {
            api.sendMessage({
                body: "✅ Here's your downloaded Instagram video!",
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => {
                fs.unlinkSync(filePath); // cleanup
            }, event.messageID);
        });

        writer.on('error', () => {
            api.sendMessage("❌ Error while saving the video. Please try again later.", event.threadID, event.messageID);
        });

    } catch (error) {
        console.error("Instagram download error:", error.message);
        api.sendMessage("❌ Failed to download the Instagram video. Please try again later.\nMake sure the link looks like:\nhttps://www.instagram.com/reel/DH9BzTFPxs8/?igsh=YzljYTk1ODg3Zg==", event.threadID, event.messageID);
    }
};