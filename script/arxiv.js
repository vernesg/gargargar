const axios = require('axios');

module.exports.config = {
  name: 'arxiv',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: 'Fetch article from arXiv',
  usage: 'arxiv <word>',
  credits: 'developer',
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  const query = args.join(' ');

  if (!query) {
    return api.sendMessage(
      '❌ Usage: provide search term\n\nExample: arxiv love',
      threadID,
      messageID
    );
  }

  await api.sendMessage('⌛ Searching, please wait...', threadID, messageID);

  try {
    const apiUrl = `https://jerome-web.gleeze.com/service/api/arxiv?query=${encodeURIComponent(query)}`;
    const response = await axios.get(apiUrl);
    const { query_info, article } = response.data;

    if (!article) {
      return api.sendMessage(`❌ No articles found for the query: "${query}".`, threadID, messageID);
    }

    const message = `
Title: ${article.title}
Authors: ${article.authors.join(', ')}
Published: ${article.published}

Summary:
• ${article.summary}

Link: ${article.id}
    `;

    return api.sendMessage(message.trim(), threadID, messageID);
  } catch (error) {
    console.error('❌ Error fetching article:', error.response?.data || error.message);
    return api.sendMessage(
      '❌ An error occurred while fetching the article. Please try again later.',
      threadID,
      messageID
    );
  }
};