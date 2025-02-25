const os = require('os');
const pidusage = require('pidusage');

module.exports["config"] = {
    name: "uptime",
    version: "1.0.2",
    role: 0,
    credits: "aminul",
    description: "Displays uptime and system information",
    hasPrefix: true,
    cooldowns: 5,
    aliases: ["up"]
};

// Convert bytes to a more readable format (MB, GB, etc.)
function byte2mb(bytes) {
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let l = 0, n = parseInt(bytes, 10) || 0;
    while (n >= 1024 && ++l) n = n / 1024;
    return `${n.toFixed(n < 10 && l > 0 ? 1 : 0)} ${units[l]}`;
}

// Get formatted uptime
function getUptime(uptime) {
    const days = Math.floor(uptime / (3600 * 24));
    const hours = Math.floor((uptime % (3600 * 24)) / 3600);
    const mins = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    return `${days} days, ${hours} hours, ${mins} minutes, and ${seconds} seconds`;
}

module.exports["run"] = async ({ api, event, fonts, chat }) => {
    try {
        const time = process.uptime();
        const hours = Math.floor(time / (60 * 60));
        const minutes = Math.floor((time % (60 * 60)) / 60);
        const seconds = Math.floor(time % 60);

        const usage = await pidusage(process.pid);

        const osInfo = {
            platform: os.platform(),
            architecture: os.arch()
        };
        const tin = txt => fonts.thin(txt);

        const timeStart = Date.now();
        const returnResult = `Running for ${hours} hour(s) ${minutes} minute(s) ${seconds} second(s).\n\n` +
            `❖ CPU usage: ${usage.cpu.toFixed(1)}%\n` +
            `❖ RAM usage: ${byte2mb(usage.memory)}\n` +
            `❖ Cores: ${os.cpus().length}\n` +
            `❖ Ping: ${Date.now() - timeStart}ms\n` +
            `❖ Operating System Platform: ${osInfo.platform}\n` +
            `❖ System CPU Architecture: ${osInfo.architecture}`;

        return chat.reply(tin(returnResult));
    } catch (error) {
        console.error("Error in uptime command:", error);
        return chat.reply("An error occurred while fetching uptime information.");
    }
};
