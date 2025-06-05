const axios = require("axios");

module.exports.config = {
  name: "zip",
  version: "1.0.0",
  role: 0,
  hasPrefix: false,
  aliases: [],
  description: "Get location information based on country and zip code.",
  usage: "zip {countryCode} {zipcode}",
  credits: "developer",
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!args || args.length < 2) {
    return api.sendMessage(
      "✦ Please provide a country code and a zip code.\n\nExample: zip ph 6515",
      threadID,
      messageID
    );
  }

  const countryCode = args[0].toLowerCase();
  const zipCode = args[1];
  const apiUrl = `https://kaiz-apis.gleeze.com/api/zipcodeinfo?country=${encodeURIComponent(
    countryCode
  )}&zipcode=${encodeURIComponent(
    zipCode
  )}&apikey=bbcc44b9-4710-41c7-8034-fa2000ea7ae5`;

  try {
    const { data } = await axios.get(apiUrl);

    if (!data || !data.places || data.places.length === 0) {
      throw new Error("No data found.");
    }

    const {
      "post code": postCode,
      country,
      "country abbreviation": countryAbbr,
      places,
    } = data;

    const { "place name": placeName, longitude, latitude } = places[0];

    const locationInfo = `
📍 Place Name: ${placeName}
🏷️ Zip Code: ${postCode}
🌍 Country: ${country} (${countryAbbr})
📌 Longitude: ${longitude}
📌 Latitude: ${latitude}
    `;

    return api.sendMessage(locationInfo.trim(), threadID, messageID);
  } catch (error) {
    console.error("zip command error:", error.message);
    return api.sendMessage(
      "Sorry, an error occurred while fetching zip code information.",
      threadID,
      messageID
    );
  }
};