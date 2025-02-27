/**
 * @file sim.js
 * @description A command module that interacts with a local JSON response system with teaching functionality.
 * @version 1.4.0
 * @author Developer
 */

const fs = require('fs');

module.exports.config = {
    name: 'sim',
    version: '1.4.0',
    role: 0,
    description: "Engage in conversation with a local JSON based bot or teach it new responses. Example: sim teach [keyword] [response] or sim [lang] [prompt]",
    usage: "sim [lang] [prompt] or sim teach [keyword] [response]",
    credits: 'Developer',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    const supportedLanguages = ['en', 'es', 'fr'];
    let lang = "en";
    let input = args.join(" ").toLowerCase();

    if (args.length > 1 && args[0].length === 2) {
        const potentialLang = args.shift();
        if (supportedLanguages.includes(potentialLang)) {
            lang = potentialLang;
        } else {
            api.sendMessage(`Invalid language code. Supported languages: ${supportedLanguages.join(', ')}`, event.threadID, event.messageID);
            return;
        }
        input = args.join(" ").toLowerCase();
    }

    if (args[0] === "teach" && args.length >= 3) {
        const keyword = args[1].toLowerCase();
        const response = args.slice(2).join(" ");
        teachResponse(api, event, keyword, response);
        return;
    }

    if (!input) {
        api.sendMessage("Please provide a text prompt or use 'teach' to teach me. Usage: sim [lang] [text] or sim teach [keyword] [response]", event.threadID, event.messageID);
        return;
    }

    try {
        api.sendMessage("Typing...", event.threadID, event.messageID);

        const responses = JSON.parse(fs.readFileSync('./responses.json', 'utf8'));
        let response = "I don't understand. Please try again.";

        if (responses.languages && responses.languages[lang]) {
            if (responses.languages[lang][input]) {
                response = getRandomElement(responses.languages[lang][input]);
            }
        }

        for (const category in responses) {
            if (category !== "languages" && category !== "learned") {
                for (const keyword in responses[category]) {
                    if (input.includes(keyword)) {
                        response = getRandomElement(responses[category][keyword]);
                        break;
                    }
                }
            }
        }

        if (responses.learned[input]) {
            response = getRandomElement(responses.learned[input]);
        }

        api.sendMessage(response, event.threadID, event.messageID);

    } catch (error) {
        console.error("Sim command error:", error);
        api.sendMessage("An error occurred. Please try again later.", event.threadID, event.messageID);
    }
};

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function teachResponse(api, event, keyword, response) {
    try {
        const responses = JSON.parse(fs.readFileSync('./responses.json', 'utf8'));
        if (!responses.learned[keyword]) {
            responses.learned[keyword] = [];
        }
        responses.learned[keyword].push(response);
        fs.writeFileSync('./responses.json', JSON.stringify(responses, null, 2));
        api.sendMessage(`I have learned that when you say "${keyword}", I should respond with "${response}".`, event.threadID, event.messageID);
    } catch (error) {
        console.error("Teach error:", error);
        api.sendMessage("Failed to teach the response.", event.threadID, event.messageID);
    }
}
