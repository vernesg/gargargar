const fs = require('fs');
const path = require('path');

// Define the paths to the databases
const plantsPath = path.join(__dirname, '../database/plants');
const seedsPath = path.join(__dirname, '../database/own_seeds');
const coinBalanceDir = path.join(__dirname, '../database/coin_balances');

// Create the directories if they do not exist
if (!fs.existsSync(plantsPath)) fs.mkdirSync(plantsPath, { recursive: true });
if (!fs.existsSync(seedsPath)) fs.mkdirSync(seedsPath, { recursive: true });
if (!fs.existsSync(coinBalanceDir)) fs.mkdirSync(coinBalanceDir, { recursive: true });

// Define the plants and their properties
const plantData = {
    "🌽": { name: "Corn", price: 10, hoursToHarvest: 3, description: "A tall grain plant." },
    "🥕": { name: "Carrot", price: 8, hoursToHarvest: 2, description: "An orange root vegetable." },
    "🫚": { name: "Ginger", price: 12, hoursToHarvest: 4, description: "A spicy root." },
    "🥦": { name: "Broccoli", price: 9, hoursToHarvest: 3, description: "A green vegetable." },
    "🥒": { name: "Cucumber", price: 7, hoursToHarvest: 2, description: "A refreshing vegetable." },
    "🥬": { name: "Lettuce", price: 5, hoursToHarvest: 1, description: "A leafy green." },
    "🫛": { name: "Peas", price: 6, hoursToHarvest: 2, description: "Small green legumes." },
    "🫑": { name: "Bell Pepper", price: 11, hoursToHarvest: 3, description: "A colorful vegetable." },
    "🍆": { name: "Eggplant", price: 13, hoursToHarvest: 4, description: "A purple vegetable." },
    "🍠": { name: "Sweet Potato", price: 15, hoursToHarvest: 5, description: "A sweet root vegetable." },
    "🧄": { name: "Garlic", price: 10, hoursToHarvest: 3, description: "A pungent bulb." },
    "🥔": { name: "Potato", price: 8, hoursToHarvest: 2, description: "A starchy tuber." },
    "🍍": { name: "Pineapple", price: 20, hoursToHarvest: 6, description: "A tropical fruit." },
    "🌰": { name: "Chestnut", price: 18, hoursToHarvest: 5, description: "A nutty treat." },
    "🥜": { name: "Peanut", price: 7, hoursToHarvest: 2, description: "A crunchy legume." },
    "🍅": { name: "Tomato", price: 9, hoursToHarvest: 3, description: "A juicy fruit." }
};

// Function to load the user's plants
function loadPlants(userId) {
    const filePath = path.join(plantsPath, `${userId}.json`);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return {};
}

// Function to save the user's plants
function savePlants(userId, plants) {
    const filePath = path.join(plantsPath, `${userId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(plants, null, 2));
}

// Function to load the user's owned seeds
function loadSeeds(userId) {
    const filePath = path.join(seedsPath, `${userId}.json`);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return [];
}

// Function to save the user's owned seeds
function saveSeeds(userId, seeds) {
    const filePath = path.join(seedsPath, `${userId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(seeds, null, 2));
}

// Function to load the user's coin balance
function loadCoinBalance(userId) {
    const filePath = path.join(coinBalanceDir, `${userId}.json`);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return 0;
}

// Function to save the user's coin balance
function saveCoinBalance(userId, balance) {
    const filePath = path.join(coinBalanceDir, `${userId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(balance));
}

// Function to generate the farm map
function generateFarmMap(plants) {
    let map = "";
    for (let i = 1; i <= 20; i++) {
        const plantEmoji = Object.keys(plants).find(key => plants[key].position === i);
        if (plantEmoji) {
            map += plants[plantEmoji].readyToHarvest ? plantEmoji : '🫘';
        } else {
            map += '🕳️';
        }
        if (i % 5 === 0) map += '\n';
    }
    return map;
}

// Function to check if a plant is ready to harvest
function isReadyToHarvest(plant) {
    const plantedTime = plant.plantedAt;
    const hoursToHarvest = plant.hoursToHarvest;
    const currentTime = Date.now();
    const elapsedHours = (currentTime - plantedTime) / (1000 * 60 * 60);
    return elapsedHours >= hoursToHarvest;
}

// Command to handle farm game actions
module.exports = {
    name: 'farm',
    role: 'user',
    description: 'Manage your farm by planting and harvesting crops.',
    credits: 'Rejardlangsakalam',
    execute(api, event, args) {
        const userId = event.senderID;
        const plants = loadPlants(userId);
        const seeds = loadSeeds(userId);
        const coinBalance = loadCoinBalance(userId);
        const action = args[0];

        if (action === 'view') {
            for (const key in plants) {
                plants[key].readyToHarvest = isReadyToHarvest(plants[key]);
            }
            savePlants(userId, plants);

            const farmMap = generateFarmMap(plants);
            api.sendMessage(`Your Farm:\n${farmMap}`, event.threadID, event.messageID);

        } else if (action === 'plant') {
            const position = parseInt(args[1]);
            const plantType = args[2];
            if (!position || !plantType || !plantData[plantType]) {
                api.sendMessage("Invalid usage. Example: farm plant <position> <plantType>", event.threadID, event.messageID);
                return;
            }

            if (position < 1 || position > 20) {
                api.sendMessage("Invalid position. Position must be within the range 1-20.", event.threadID, event.messageID);
                return;
            }

            if (Object.values(plants).some(p => p.position === position)) {
                api.sendMessage("A plant is already planted at this position.", event.threadID, event.messageID);
                return;
            }

            if (!seeds.includes(plantType)) {
                api.sendMessage(`You do not own any ${plantData[plantType].name} seeds.`, event.threadID, event.messageID);
                return;
            }

            plants[plantType] = {
                ...plantData[plantType],
                plantedAt: Date.now(),
                harvested: false,
                readyToHarvest: false,
                position: position
            };

            const seedIndex = seeds.indexOf(plantType);
            seeds.splice(seedIndex, 1);
            savePlants(userId, plants);
            saveSeeds(userId, seeds);

            const farmMap = generateFarmMap(plants);
            api.sendMessage(`You planted a ${plantData[plantType].name} at position ${position}.\n\nYour Farm:\n${farmMap}`, event.threadID, event.messageID);

        } else if (action === 'harvest') {
            let totalHarvest = 0;
            let harvestDetails = 'Harvested Plants:\n';
            for (const key in plants) {
                if (isReadyToHarvest(plants[key])) {
                    totalHarvest += plantData[key].price * 150;
                    harvestDetails += `${plantData[key].name} (${plantData[key].price * 150} coins)\n`;
                    delete plants[key];
                }
            }

            const updatedCoinBalance = coinBalance + totalHarvest;
            saveCoinBalance(userId, updatedCoinBalance);
            savePlants(userId, plants);

            const farmMap = generateFarmMap(plants);
            api.sendMessage(`${harvestDetails}\nTotal Earned: ${totalHarvest} coins.\nYour new balance is ${updatedCoinBalance} coins.\n\nYour Farm:\n${farmMap}`, event.threadID, event.messageID);

        } else if (action === 'guide') {
            let guideMessage = 'Available Plants:\n';
            for (const key in plantData) {
                const plant = plantData[key];
                guideMessage += `${key} - ${plant.name}: ${plant.description} (Price: ${plant.price} coins, Hours to Harvest: ${plant.hoursToHarvest})\n`;
            }
            api.sendMessage(guideMessage, event.threadID, event.messageID);

        } else if (action === 'inventory') {
            let inventoryMessage = 'Your Seed Inventory:\n';
            if (seeds.length === 0) {
                inventoryMessage += 'You have no seeds.';
            } else {
                seeds.forEach(seed => {
                    inventoryMessage += `${plantData[seed].name}\n`;
                });
            }
            api.sendMessage(inventoryMessage, event.threadID, event.messageID);

        } else {
            api.sendMessage("Invalid action. Use 'farm view', 'farm plant <position> <plantType>', 'farm harvest', 'farm guide', or 'farm inventory'.", event.threadID, event.messageID);
        }
    }
};