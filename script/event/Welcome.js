module.exports = {
    async handleEvent(api, event) {
        // Check if there are added participants in the event
        if (event.logMessageData?.addedParticipants) {
            // Use Promise.all to handle multiple asynchronous operations
            const participantPromises = event.logMessageData.addedParticipants.map(async (participant) => {
                try {
                    // Fetch user info for the added participant
                    const info = await api.getUser Info(participant.userFbId);
                    const { name } = info[participant.userFbId];

                    // Check if the added participant is the bot itself
                    if (participant.userFbId === api.getCurrentUser ID()) {
                        // Get group info
                        const threadInfo = await api.getThreadInfo(event.threadID);
                        const groupName = threadInfo.threadName;
                        const memberCount = threadInfo.participantIDs.length;

                        // Send a welcome message to the group indicating the bot is online
                        await api.sendMessage(`✅ Hello! This bot is now Online in ${groupName}\nMembers: ${memberCount}\n—————————————\nℹ️• Feel free to use it anytime!\nℹ️• 24/7 Active!\nℹ️• Owner: https://www.facebook.com/profile.php?id=100071880593545 \nℹ️• Co-owner: https://www.facebook.com/profile.php?id=br4nd.abir.your.next.bf.jan \n—————————————`, event.threadID);
                    } else {
                        // Send a welcome message to the newly added participant
                        await api.sendMessage(`Welcome ${name} to the group!`, event.threadID);
                    }
                } catch (error) {
                    console.error("Error fetching user info or sending message:", error);
                }
            });

            // Wait for all participant promises to resolve
            await Promise.all(participantPromises);
        }
    }
};
