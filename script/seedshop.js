const fs = require('fs');
const path = require('path');

const coinBalancesPath = path.join(__dirname, '../database/coin_balances');
const seedsPath = path.join(__dirname, '../database/own_seeds');

// Define seed prices and descriptions based on farm.js plantData
const seedPrices = {
    "🌽": 10,
    "🥕": 8,
    "🫚": 12,
    "🥦": 9,
    "🥒": 7,
    "🥬": 5,
    "🫛": 6,
    "🫑": 11,
    "🍆": 13,
    "🍠": 15,
    "🧄": 10,
    "🥔": 8,
    "🍍": 20,
    "🌰": 18,
    "🥜": 7,
    "🍅": 9
};

const seedDescriptions = {
    "🌽": "Plant a corn seed on your farm.",
    "🥕": "Plant a carrot seed on your farm.",
    "🫚": "Plant a ginger seed on your farm.",
    "🥦": "Plant a broccoli seed on your farm.",
    "🥒": "Plant a cucumber seed on your farm.",
    "🥬": "Plant a lettuce seed on your farm.",
    "🫛": "Plant a peas seed on your farm.",
    "🫑": "Plant a bell pepper seed on your farm.",
    "🍆": "Plant an eggplant seed on your farm.",
    "🍠": "Plant a sweet potato seed on your farm.",
    "🧄": "Plant a garlic seed on your farm.",
    "🥔": "Plant a potato seed on your farm.",
    "🍍": "Plant a pineapple seed on your farm.",
    "🌰": "Plant a chestnut seed on your farm.",
    "🥜": "Plant a peanut seed on your farm.",
    "🍅": "Plant a tomato seed on your farm."
};

// Function to load user's coin balance
function loadCoinBalance(userId) {
    const coinBalanceFile = path.join(coinBalancesPath, `${userId}.json`);
    if (fs.existsSync(coinBalanceFile)) {
        return JSON.parse(fs.readFileSync(coinBalanceFile, 'utf8'));
    }
    return 0;
}

// Function to save user's coin balance
function saveCoinBalance(userId, balance) {
    const coinBalanceFile = path.join(coinBalancesPath, `${userId}.json`);
    fs.writeFileSync(coinBalanceFile, JSON.stringify(balance));
}

// Function to load user's seeds
function loadSeeds(userId) {
    const seedsFilePath = path.join(seedsPath, `${userId}.json`);
    if (fs.existsSync(seedsFilePath)) {
        return JSON.parse(fs.readFileSync(seedsFilePath, 'utf8'));
    }
    return [];
}

// Function to save user's seeds
function saveSeeds(userId, seeds) {
    const seedsFilePath = path.join(seedsPath, `${userId}.json`);
    fs.writeFileSync(seedsFilePath, JSON.stringify(seeds, null, 2));
}

// Seedshop command module
module.exports = {
    name: 'seedshop',
    description: 'Browse and purchase seeds for your farm.',
    role: 'user',
    execute(api, event, args) {
        const userId = event.senderID;

        // Check if args array is empty or undefined
        if (!args || args.length === 0) {
            let itemList = 'Available seeds in the shop:\n';
            Object.entries(seedPrices).forEach(([seed, price]) => {
                itemList += `${seed}: ${price} coins\nDescription: ${seedDescriptions[seed]}\n\n`;
            });
            api.sendMessage(itemList, event.threadID, event.messageID);
            return;
        }

        // Convert the seed emoji to a valid plant type
        const seedEmoji = args[0];
        const plantType = Object.keys(seedDescriptions).find(key => key === seedEmoji);

        // Check if the provided seed exists
        if (!plantType) {
            api.sendMessage('Invalid seed.', event.threadID, event.messageID);
            return;
        }

        // Check if amount is provided and valid
        let amount = 1; // Default amount
        if (args.length >= 2 && (!isNaN(args[1]) && parseInt(args[1]) > 0)) {
            amount = parseInt(args[1]);
        } else {
            api.sendMessage(`Please specify a valid amount for ${seedEmoji}.`, event.threadID, event.messageID);
            return;
        }

        // Load the user's coin balance
        const coinBalance = loadCoinBalance(userId);

        // Calculate the total price
        const totalPrice = seedPrices[seedEmoji] * amount;

        // Check if the user has enough coins to purchase the seed
        if (coinBalance < totalPrice) {
            const neededCoins = totalPrice - coinBalance;
            api.sendMessage(`You need ${neededCoins} more coins to purchase this item.`, event.threadID, event.messageID);
            return;
        }

        // Load the user's seed data
        let seeds = loadSeeds(userId);

        // Add the purchased seeds to the user's inventory
        for (let i = 0; i < amount; i++) {
            seeds.push(plantType);
        }

        // Save the updated seed data
        saveSeeds(userId, seeds);

        // Deduct the cost of the seed from the user's coin balance
        const newCoinBalance = coinBalance - totalPrice;
        saveCoinBalance(userId, newCoinBalance);

        // Send a confirmation message to the user
        const confirmationMessage = `Seed "${plantType}" (${seedEmoji}) purchased successfully!\nAmount: ${amount}\nTotal Cost: ${totalPrice} coins\n\nYour new balance: ${newCoinBalance} coins.`;
        api.sendMessage(confirmationMessage, event.threadID, event.messageID);
    }
};