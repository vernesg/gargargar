const axios = require('axios');

module.exports.config = {
  name: 'weather',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: 'Get current weather information for a location',
  usage: 'weather {location}',
  credits: 'developer',
  cooldown: 3
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!args || args.length === 0) {
    return api.sendMessage('Please provide a specific location.', threadID, messageID);
  }

  const location = args.join(' ');
  const apiUrl = `https://kaiz-apis.gleeze.com/api/weather?q=${encodeURIComponent(location)}&apikey=bbcc44b9-4710-41c7-8034-fa2000ea7ae5`;

  try {
    const response = await axios.get(apiUrl);
    const weatherData = response.data["0"];

    if (!weatherData) {
      throw new Error("Invalid response format.");
    }

    const { location: place, current } = weatherData;
    const {
      temperature,
      skytext,
      humidity,
      winddisplay,
      feelslike,
      date,
      observationtime,
      observationpoint
    } = current;

    const weatherMessage = `
Location: ${place.name}
Temperature: ${temperature}°C
Sky: ${skytext}
Humidity: ${humidity}%
Wind: ${winddisplay}
Feels Like: ${feelslike}°C
Date: ${date}
Observation Time: ${observationtime}
Observation Point: ${observationpoint}
    `;

    return api.sendMessage(weatherMessage.trim(), threadID, messageID);

  } catch (error) {
    console.error('Error fetching weather info:', error.message);
    return api.sendMessage('Sorry, an error occurred while fetching weather information.', threadID, messageID);
  }
};