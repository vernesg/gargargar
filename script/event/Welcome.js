const axios = require('axios');
const fs = require('fs');

module.exports.config = {
    name: "welcome",
    version: "1.0.0"
};

module.exports.handleEvent = async function ({ api, event }) {
    if (event.logMessageType === "log:subscribe") {
        const addedParticipants = event.logMessageData.addedParticipants;
        const senderID = addedParticipants[0].userFbId;
        let name = await api.getUserInfo(senderID).then(info => info[senderID].name);

        const maxLength = 15;
        if (name.length > maxLength) {
            name = name.substring(0, maxLength - 3) + '...';
        }

        const groupInfo = await api.getThreadInfo(event.threadID);
        const groupIcon = groupInfo.imageSrc || "https://i.ibb.co/G5mJZxs/rin.jpg";
        const memberCount = groupInfo.participantIDs.length;
        const groupName = groupInfo.threadName || "this group";
        const background = groupIcon; // You can use a separate image if needed

        const apiKey = "86397083-298d-4b97-a76e-414c1208beae";
        const apiUrl = `https://kaiz-apis.gleeze.com/api/welcome?username=${encodeURIComponent(name)}&avatarUrl=https://graph.facebook.com/${senderID}/picture?width=512&height=512&groupname=${encodeURIComponent(groupName)}&bg=${encodeURIComponent(background)}&memberCount=${memberCount}&apikey=${apiKey}`;

        try {
            const { data } = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            const filePath = './script/cache/welcome_image.jpg';
            fs.writeFileSync(filePath, Buffer.from(data));

            api.sendMessage({
                body: `🎉 Welcome ${name} to ${groupName}!`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => fs.unlinkSync(filePath));
        } catch (error) {
            console.error("Error fetching welcome image:", error);

            api.sendMessage({
                body: `🎉 Welcome ${name} to ${groupName}!`
            }, event.threadID);
        }
    }
};