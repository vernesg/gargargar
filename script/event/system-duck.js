const axios = require('axios');

module.exports.config = {
  name: 'duck-bot',
  version: '1.0.2',
};

module.exports.handleEvent = async function ({ api, event }) {
  const wordTrigger = ['duck', 'quack', 'quak', 'etik', 'bby', 'bebe'];
  
 const lowercasedBody = event.body ? event.body.toLowerCase() : '';
 
  for (const word of wordTrigger) {
    if (lowercasedBody.toLowerCase().includes(word)) {
      try {
        const response = await axios.get(`https://random-d.uk/api/v2/random`);
        const imageUrl = response.data.url;
        const options = { responseType: 'stream' };
        const imageResponse = await axios.get(imageUrl, options);
        const attachment = { attachment: imageResponse.data };

        api.sendMessage(attachment, event.threadID);

      } catch (error) {
        console.error('Error fetching duck picture:', error);
      }
      
    }
  }
};
