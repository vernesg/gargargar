module.exports = {
    name: "Group Event Handler", // Added name
    version: "1.1.0", // Added version
    credits: "Your Name/Team Name", // Added credits
    usePrefix: false, // Added usePrefix (adjust as needed)
    async handleEvent(api, event) {
        if (event.logMessageData?.addedParticipants) {
            event.logMessageData.addedParticipants.forEach(async (participant) => {
                try {
                    const info = await api.getUserInfo(participant.userFbId);
                    const { name } = info[participant.userFbId];

                    if (participant.userFbId === api.getCurrentUserID()) {
                        // Get group info
                        const threadInfo = await api.getThreadInfo(event.threadID);
                        const groupName = threadInfo.threadName;
                        const memberCount = threadInfo.participantIDs.length;

                        // If the bot is added to the group
                        api.sendMessage(`✅ Hello! This bot is now Online in ${groupName}\nMembers: ${memberCount}\n—————————————\nℹ️• Feel free to use it anytime!\nℹ️• 24/7 Active!\nℹ️• Owner: https://www.facebook.com/profile.php?id=100071880593545 \nℹ️• Co-owner: https://www.facebook.com/profile.php?id=br4nd.abir.your.next.bf.jan \n—————————————\n\nVersion: ${this.version}\nCredits: ${this.credits}`, event.threadID); // Added version and credits to the message.

                    } else {
                        // If any other participant is added to the group
                        api.sendMessage(`Welcome ${name} to the group!`, event.threadID);
                    }
                } catch (error) {
                    console.error("Error:", error);
                }
            });
        }
    }
};
