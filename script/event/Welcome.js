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
        const url = `https://kaiz-apis.gleeze.com/api/welcome?username=${encodeURIComponent(name)}&avatarUrl=https://scontent.xx.fbcdn.net/v/t1.15752-9/455020392_3836507706596463_5673950550239467059_n.jpg?stp=dst-jpg_s480x480_tt6&_nc_cat=108&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeGFfR2_seWRZjgzQTsyPs17xlJdpLxTcrfGUl2kvFNyt_c7thKkpQ9_dpQdgcPcj9_Guio2y0TBJkRcYaP6NgmM&_nc_ohc=LRE6ktZDCd8Q7kNvwFwlWH5&_nc_oc=AdnUYCAb4LdWco0Fl0F9fQPsrAPaKdSIlqsQeH7knHJ1EmdF0olKR7rykT44O5R6hPc&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.xx&oh=03_Q7cD2gEiBdeK1ltIZrDBf0g-eOTuNkqL46jCj8mMfpOQIFGOvQ&oe=6868610D&groupname=${encodeURIComponent(groupName)}&bg=${encodeURIComponent(background)}&memberCount=${memberCount}&apikey=${apiKey}`;

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