const axios = require('axios');
const fs = require('fs');

module.exports.config = {
    name: "welcome",
    version: "1.0.0",
};

module.exports.handleEvent = async function ({ api, event }) {
    if (event.logMessageType === "log:subscribe") {
        const addedParticipants = event.logMessageData.addedParticipants;
        const senderID = addedParticipants[0].userFbId;

        // Fetch user profile name
        let name = await api.getUserInfo(senderID).then(info => info[senderID].name);

        // Truncate name if it's too long
        const maxLength = 15;
        if (name.length > maxLength) {
            name = name.substring(0, maxLength - 3) + '...';
        }

        // Fetch group info
        const groupInfo = await api.getThreadInfo(event.threadID);
        const groupIcon = groupInfo.imageSrc || "https://i.ibb.co/G5mJZxs/rin.jpg"; // Fallback image if no group photo
        const memberCount = groupInfo.participantIDs.length;
        const groupName = groupInfo.threadName || "this group"; // Fallback group name

        const background = groupInfo.imageSrc || "https://i.ibb.co/4YBNyvP/images-76.jpg"; // Use group photo or fallback background
        const avatarUrl = `https://graph.facebook.com/${senderID}/picture?width=512&height=512`;

        // Build the welcome image API URL
        const apiKey = "86397083-298d-4b97-a76e-414c1208beae";
        const url = `https://kaiz-apis.gleeze.com/api/welcome?username=${encodeURIComponent(name)}&avatarUrl=${encodeURIComponent(avatarUrl)}&groupname=${encodeURIComponent(groupName)}&bg=${encodeURIComponent(background)}&memberCount=${memberCount}&apikey=${apiKey}`;

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

            // Fallback message if image fetching fails
            api.sendMessage({
                body: `Everyone welcome the new member ${name} to ${groupName}!`
            }, event.threadID);
        }
    }
};