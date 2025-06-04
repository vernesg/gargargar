module.exports.config = {
    name: "pinterest",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ry",
    description: "Image search",
    commandCategory: "Search",
    usePrefix: false,
    usages: "[text] - [amount]",
    cooldowns: 0,
};

module.exports.run = async function ({ api, event, args }) {
    const axios = require("axios");
    const fs = require("fs-extra");

    const input = args.join(" ");
    if (!input.includes("-")) {
        return api.sendMessage(
            "❗ Please enter in the correct format.\n📌 Example: pinterest cat - 5",
            event.threadID,
            event.messageID
        );
    }

    const searchTerm = input.substring(0, input.indexOf("-")).trim();
    const limit = parseInt(input.split("-").pop().trim()) || 5;

    if (isNaN(limit) || limit < 1 || limit > 30) {
        return api.sendMessage("⚠️ Please enter a number between 1 and 30.", event.threadID, event.messageID);
    }

    try {
        const response = await axios.get(`https://ccprojectsapis.zetsu.xyz/api/pin?title=${encodeURIComponent(searchTerm)}&count=${limit}`);
        const results = response.data?.data;

        if (!results || results.length === 0) {
            return api.sendMessage(`❌ No results found for "${searchTerm}".`, event.threadID, event.messageID);
        }

        const imgData = [];
        for (let i = 0; i < Math.min(limit, results.length); i++) {
            const imgPath = `${__dirname}/cache/pinterest_${i + 1}.jpg`;
            const imageBuffer = (await axios.get(results[i], { responseType: "arraybuffer" })).data;
            fs.writeFileSync(imgPath, imageBuffer);
            imgData.push(fs.createReadStream(imgPath));
        }

        api.sendMessage({
            body: `🖼️ Showing ${imgData.length} results for: "${searchTerm}"`,
            attachment: imgData
        }, event.threadID, event.messageID);

        // Cleanup
        for (let i = 0; i < imgData.length; i++) {
            const imgPath = `${__dirname}/cache/pinterest_${i + 1}.jpg`;
            fs.unlinkSync(imgPath);
        }

    } catch (error) {
        console.error("Pinterest search error:", error);
        api.sendMessage("❌ An error occurred while fetching images from Pinterest.", event.threadID, event.messageID);
    }
};