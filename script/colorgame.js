const fs = require('fs');
const path = require('path');

const colors = ['🟥', '🟦', '🟩'];
const MIN_BET = 50;
const MAX_BET = 1000000000;

function generateDraw() {
    let draw = [];
    for (let i = 0; i < 3; i++) {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        draw.push(randomColor);
    }
    return draw;
}

function calculateWinnings(draw, selectedColor, betAmount) {
    const matchingColors = draw.filter(color => color === selectedColor).length;

    if (matchingColors === 2) {
        return betAmount * 3; // Win x2 for two matching colors
    } else if (matchingColors === 3) {
        return betAmount * 4; // Win x3 for three matching colors
    } else {
        return -betAmount; // Lose the bet amount
    }
}

module.exports = {
    name: 'colorgame',
    description: 'Play a color game by betting coins on a color.',
    role: 'user',
    credits: 'rejardgwapo',
    cooldown: 0, // 1 minute cooldown
    execute(api, event, args, command) {
        const userId = event.senderID;
        const selectedColor = args[0];
        const betAmount = parseInt(args[1]);

        if (!colors.includes(selectedColor) || isNaN(betAmount) || betAmount < MIN_BET || betAmount > MAX_BET) {
            api.sendMessage(`Please enter a valid color (🟥, 🟦, 🟩) and bet amount between ${MIN_BET} and ${MAX_BET}.`, event.threadID, event.messageID);
            return;
        }

        const coinBalanceFile = path.join(__dirname, `../database/coin_balances/${userId}.json`);
        let coinBalance = 0;
        if (fs.existsSync(coinBalanceFile)) {
            coinBalance = JSON.parse(fs.readFileSync(coinBalanceFile, 'utf8'));
        }

        if (coinBalance < betAmount) {
            api.sendMessage(`You don't have enough coins to bet ${betAmount}.`, event.threadID, event.messageID);
            return;
        }

        const draw = generateDraw();
        const winnings = calculateWinnings(draw, selectedColor, betAmount);

        // Update coin balance
        coinBalance += winnings;

        fs.writeFileSync(coinBalanceFile, JSON.stringify(coinBalance));

        let drawMessage = 'Here is the draw result:\n';
        drawMessage += draw.join(' ') + '\n';

        let resultMessage = winnings > 0
            ? `Congratulations! You won ${winnings} coins!`
            : `Sorry, you lost ${-winnings} coins.`;

        api.sendMessage(`${drawMessage}\n${resultMessage}\nYou now have ${coinBalance} coins.`, event.threadID, event.messageID);
    }
};