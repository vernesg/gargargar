const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const startTime = Date.now(); // Save this globally for uptime tracking

module.exports.config = {
    name: "uptime",
    version: "1.1.0",
    permission: 0,
    description: "Get the bot uptime image",
    prefix: false,
    premium: false,
    credits: "developer",
    cooldowns: 5,
    category: "system"
};

module.exports.run = async function ({ api, event }) {
    try {
        // Calculate uptime
        const uptimeMs = Date.now() - startTime;
        const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
        const minutes = Math.floor((uptimeMs / (1000 * 60)) % 60);
        const seconds = Math.floor((uptimeMs / 1000) % 60);

        const imageUrl = `https://kaiz-apis.gleeze.com/api/uptime?instag=Ai Assistant &ghub=AI Assistant&fb=AI Assistant &hours=${hours}&minutes=${minutes}&seconds=${seconds}&botname=AI Assistant&apikey=bbcc44b9-4710-41c7-8034-fa2000ea7ae5`;
        const fileName = `uptime_${event.senderID}.png`;
        const filePath = path.join(__dirname, "cache", fileName);

        const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, response.data);

        api.sendMessage({
            body: "✅ AI Assistant is alive and running!",
            attachment: fs.createReadStream(filePath)
        }, event.threadID, () => {
            fs.unlink(filePath).catch(() => {});
        }, event.messageID);

    } catch (error) {
        console.error("Uptime error:", error.message);
        api.sendMessage("❌ Failed to fetch uptime image.", event.threadID, event.messageID);
    }
};