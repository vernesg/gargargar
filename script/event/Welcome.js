const axios = require('axios');
const fs = require('fs');

const API_KEY = '86397083-298d-4b97-a76e-414c1208beae'; // your new API key

module.exports.config = {
    name: "welcome",
    version: "1.0.0",
};

module.exports.handleEvent = async function ({ api, event }) {
    if (event.logMessageType === "log:subscribe") {
        const addedParticipants = event.logMessageData.addedParticipants;
        const senderID = addedParticipants[0].userFbId;

        let name = await api.getUserInfo(senderID).then(info => info[senderID].name);

        // Truncate name if it's too long
        const maxLength = 15;
        if (name.length > maxLength) {
            name = name.substring(0, maxLength - 3) + '...';
        }

        // Fetch group info
        const groupInfo = await api.getThreadInfo(event.threadID);
        const groupName = groupInfo.threadName || "this group";
        const memberCount = groupInfo.participantIDs.length;
        const background = groupInfo.imageSrc || "https://i.ibb.co/4YBNyvP/images-76.jpg";

        // Fetch user avatar URL (optional: fallback if API allows)
        let avatarUrl = null;
        try {
            const userInfo = await api.getUserInfo(senderID);
            avatarUrl = userInfo[senderID].profileUrl || "https://i.ibb.co/G5mJZxs/rin.jpg"; // fallback avatar
        } catch {
            avatarUrl = "https://i.ibb.co/G5mJZxs/rin.jpg"; // fallback avatar
        }

        // Construct URL for the new API
        const url = `https://kaiz-apis.gleeze.com/api/welcome?username=${encodeURIComponent(name)}&avatarUrl=${encodeURIComponent(avatarUrl)}&groupname=${encodeURIComponent(groupName)}&bg=${encodeURIComponent(background)}&memberCount=${memberCount}&apikey=${API_KEY}`;

        try {
            const { data } = await axios.get(url, { responseType: 'arraybuffer' });
            const filePath = './script/cache/welcome_image.jpg';
            fs.writeFileSync(filePath, Buffer.from(data));

            api.sendMessage({
                body: `Everyone welcome the new member ${name} to ${groupName}!`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => fs.unlinkSync(filePath));
        } catch (error) {
            console.error("Error fetching welcome image:", error);

            api.sendMessage({
                body: `Everyone welcome the new member ${name} to ${groupName}!`
            }, event.threadID);
        }
    }
};