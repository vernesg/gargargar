const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

const SEARCH_URL = 'https://kaiz-apis.gleeze.com/api/ytsearch';
const DOWNLOAD_URL = 'https://api.zetsu.xyz/download/youtube';
const SEARCH_API_KEY = 'ec7d563d-adae-4048-af08-0a5252f336d1';
const DOWNLOAD_API_KEY = '80836f3451c2b3392b832988e7b73cdb';

module.exports.config = {
    name: "ytvideo",
    version: "1.0.0",
    permission: 0,
    description: "Search YouTube and download video",
    prefix: false,
    premium: false,
    credits: "developer",
    cooldowns: 10,
    category: "media"
};

module.exports.run = async function ({ api, event, args }) {
    if (!args.length) {
        return api.sendMessage("❌ Provide a video title to search.", event.threadID, event.messageID);
    }

    const query = args.join(' ');
    try {
        const searchRes = await axios.get(SEARCH_URL, {
            params: {
                q: query,
                apikey: SEARCH_API_KEY
            }
        });

        const video = searchRes.data?.items?.[0];
        if (!video) {
            return api.sendMessage("⚠️ No video found.", event.threadID, event.messageID);
        }

        const { title, url, thumbnail } = video;

        const downloadRes = await axios.get(DOWNLOAD_URL, {
            params: {
                url,
                apikey: DOWNLOAD_API_KEY
            }
        });

        const result = downloadRes.data?.result;
        const bestMedia = result?.medias?.find(m => m.ext === 'mp4') || result?.medias?.[0];

        if (!bestMedia?.url) {
            return api.sendMessage("⚠️ No downloadable format found.", event.threadID, event.messageID);
        }

        // Try to get the file size first to avoid large downloads
        const head = await axios.head(bestMedia.url);
        const fileSize = parseInt(head.headers['content-length'] || '0', 10);

        if (fileSize > 25 * 1024 * 1024) {
            return api.sendMessage(
                `🎬 ${result.title}\n🔗 Video too large to send directly.\nWatch here: ${bestMedia.url}`,
                event.threadID,
                event.messageID
            );
        }

        const fileName = `${event.messageID}.mp4`;
        const filePath = path.join(__dirname, fileName);

        const videoStream = await axios({
            method: 'GET',
            url: bestMedia.url,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        videoStream.data.pipe(writer);

        writer.on('finish', () => {
            api.sendMessage({
                body: `🎬 ${result.title}\n📺 ${result.duration || 'Unknown duration'}\n💾 Quality: ${bestMedia.label || 'Unknown'}`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => {
                fs.unlinkSync(filePath);
            }, event.messageID);
        });

        writer.on('error', () => {
            api.sendMessage("❌ Error saving video. Please try again.", event.threadID, event.messageID);
        });

    } catch (error) {
        console.error('Error fetching YouTube video:', error);
        api.sendMessage("❌ Error: Something went wrong while processing your request.", event.threadID, event.messageID);
    }
};