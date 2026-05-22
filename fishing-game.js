// Game State
const gameState = {
  coins: 0,
  totalFishCaught: 0,
  upgrades: {
    lineLength: 1,
    hookCount: 1,
    incomePerSecond: 0,
    catchRate: 0.7
  },
  fishCaught: [],
  fishCaughtThisCast: [],
  isCasting: false,
  castProgress: 0,
  collection: {}
};

// Fish database
const fishDatabase = {
  shallow: [
    { name: 'Minnow', value: 10, rarity: 'common', emoji: '🐠' },
    { name: 'Goldfish', value: 25, rarity: 'uncommon', emoji: '🐟' },
    { name: 'Guppy', value: 15, rarity: 'common', emoji: '🐠' }
  ],
  medium: [
    { name: 'Bass', value: 50, rarity: 'uncommon', emoji: '🐟' },
    { name: 'Trout', value: 75, rarity: 'rare', emoji: '🐟' },
    { name: 'Perch', value: 40, rarity: 'uncommon', emoji: '🐠' }
  ],
  deep: [
    { name: 'Salmon', value: 150, rarity: 'rare', emoji: '🐟' },
    { name: 'Catfish', value: 200, rarity: 'rare', emoji: '🐟' },
    { name: 'Pike', value: 120, rarity: 'rare', emoji: '🐟' },
    { name: 'Legendary Catfish', value: 500, rarity: 'legendary', emoji: '🏆' }
  ],
  veryDeep: [
    { name: 'Anglerfish', value: 300, rarity: 'epic', emoji: '👹' },
    { name: 'Sea Dragon', value: 400, rarity: 'epic', emoji: '🐉' },
    { name: 'Kraken Squid', value: 800, rarity: 'legendary', emoji: '🦑' }
  ]
};

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const coinCountElement = document.getElementById('coinCount');
const incomeCountElement = document.getElementById('incomeCount');
const fishCaughtCountElement = document.getElementById('fishCaughtCount');
const castBtn = document.getElementById('castBtn');
const caughtText = document.getElementById('caughtText');
const collectionList = document.getElementById('collectionList');

// Animation variables
let hookX = canvas.width / 2;
let hookY = 0;
let lineY = 0;
let castDirection = 1; // 1 for down, -1 for up
let hookSpeed = 3;

// Save/Load game
function saveGame() {
  localStorage.setItem('fishingGameState', JSON.stringify(gameState));
}

function loadGame() {
  const saved = localStorage.getItem('fishingGameState');
  if (saved) {
    const loaded = JSON.parse(saved);
    Object.assign(gameState, loaded);
  }
}

// Get available fish based on line depth
function getAvailableFish(depth) {
  if (depth <= 2) return fishDatabase.shallow;
  if (depth <= 5) return fishDatabase.medium;
  if (depth <= 8) return fishDatabase.deep;
  return fishDatabase.veryDeep;
}

// Catch fish logic
function catchFish() {
  const depth = gameState.upgrades.lineLength;
  const hooks = gameState.upgrades.hookCount;
  const catchRate = gameState.upgrades.catchRate;
  
  gameState.fishCaughtThisCast = [];
  let totalValue = 0;
  
  const availableFish = getAvailableFish(depth);
  
  for (let i = 0; i < hooks; i++) {
    if (Math.random() < catchRate) {
      const fish = availableFish[Math.floor(Math.random() * availableFish.length)];
      gameState.fishCaughtThisCast.push(fish);
      gameState.totalFishCaught++;
      totalValue += fish.value;
      
      // Add to collection
      if (!gameState.collection[fish.name]) {
        gameState.collection[fish.name] = {
          ...fish,
          count: 0
        };
      }
      gameState.collection[fish.name].count++;
    }
  }
  
  gameState.coins += totalValue;
  return totalValue;
}

// Draw fishing line and hook
function drawFishingLine() {
  // Draw line
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(hookX, lineY);
  ctx.stroke();
  
  // Draw hook area (net)
  ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(hookX, lineY, 30, 40, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Draw hook itself
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(hookX, lineY, 8, 0, Math.PI * 2);
  ctx.fill();
}

// Draw fish in water
function drawFish() {
  // Draw some static fish
  ctx.font = '30px Arial';
  ctx.globalAlpha = 0.6;
  
  // Random fish scattered in water
  for (let i = 0; i < 5; i++) {
    const y = 150 + i * 80;
    const x = 100 + Math.sin(Date.now() / 1000 + i) * 50;
    ctx.fillText('🐟', x, y);
  }
  
  ctx.globalAlpha = 1;
}

// Draw caught fish display
function drawCaughtFishDisplay() {
  if (gameState.fishCaughtThisCast.length > 0) {
    ctx.font = '20px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    
    let displayText = '';
    gameState.fishCaughtThisCast.forEach((fish, index) => {
      displayText += fish.name + ' (' + fish.value + 'g)';
      if (index < gameState.fishCaughtThisCast.length - 1) displayText += ', ';
    });
    
    caughtText.textContent = '🎣 ' + displayText;
    
    setTimeout(() => {
      caughtText.textContent = '';
      gameState.fishCaughtThisCast = [];
    }, 3000);
  }
}

// Animation loop
function animate() {
  // Clear canvas with water gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(0.5, '#E0F6FF');
  gradient.addColorStop(1, '#0047AB');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw decorative water elements
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(Math.sin(Date.now() / 2000 + i) * 100 + 250, 50 + i * 30, 30, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw fish
  drawFish();
  
  // Update casting animation
  if (gameState.isCasting) {
    gameState.castProgress += 0.02;
    
    if (gameState.castProgress <= 0.5) {
      // Going down
      lineY = canvas.height * (gameState.castProgress * 2);
      hookX = canvas.width / 2 + Math.sin(gameState.castProgress * Math.PI * 2) * 30;
    } else if (gameState.castProgress <= 1) {
      // Coming back up
      lineY = canvas.height * (2 - gameState.castProgress * 2);
      hookX = canvas.width / 2 + Math.sin(gameState.castProgress * Math.PI * 2) * 30;
    } else {
      // Cast complete
      gameState.isCasting = false;
      gameState.castProgress = 0;
      castBtn.disabled = false;
      castBtn.textContent = 'CAST LINE';
      lineY = 0;
      hookX = canvas.width / 2;
      
      // Catch the fish
      catchFish();
      drawCaughtFishDisplay();
      updateUI();
    }
  }
  
  // Draw fishing line and hook
  drawFishingLine();
  
  requestAnimationFrame(animate);
}

// Handle casting
function handleCast() {
  if (!gameState.isCasting) {
    gameState.isCasting = true;
    gameState.castProgress = 0;
    castBtn.disabled = true;
    castBtn.textContent = 'CASTING...';
  }
}

// Buy upgrade
function buyUpgrade(upgradeType) {
  const costs = {
    lineLength: 100 * gameState.upgrades.lineLength,
    hookCount: 75 * gameState.upgrades.hookCount,
    income: 200 * (gameState.upgrades.incomePerSecond + 1),
    catchRate: 150 * (Math.round((gameState.upgrades.catchRate - 0.7) / 0.05) + 1)
  };
  
  if (gameState.coins >= costs[upgradeType]) {
    gameState.coins -= costs[upgradeType];
    
    if (upgradeType === 'lineLength') {
      gameState.upgrades.lineLength++;
    } else if (upgradeType === 'hookCount') {
      gameState.upgrades.hookCount++;
    } else if (upgradeType === 'income') {
      gameState.upgrades.incomePerSecond++;
    } else if (upgradeType === 'catchRate') {
      gameState.upgrades.catchRate = Math.min(gameState.upgrades.catchRate + 0.05, 0.95);
    }
    
    saveGame();
    updateUI();
  }
}

// Update UI
function updateUI() {
  coinCountElement.textContent = gameState.coins.toLocaleString();
  incomeCountElement.textContent = gameState.upgrades.incomePerSecond.toLocaleString();
  fishCaughtCountElement.textContent = gameState.totalFishCaught.toLocaleString();
  
  // Update upgrade buttons and costs
  const lineCost = 100 * gameState.upgrades.lineLength;
  const hookCost = 75 * gameState.upgrades.hookCount;
  const incomeCost = 200 * (gameState.upgrades.incomePerSecond + 1);
  const rateCost = 150 * (Math.round((gameState.upgrades.catchRate - 0.7) / 0.05) + 1);
  
  document.getElementById('lineCost').textContent = lineCost;
  document.getElementById('hookCost').textContent = hookCost;
  document.getElementById('incomeCost').textContent = incomeCost;
  document.getElementById('rateCost').textContent = rateCost;
  
  document.getElementById('lineLevelDisplay').textContent = 'Lvl ' + gameState.upgrades.lineLength;
  document.getElementById('hookLevelDisplay').textContent = 'Lvl ' + gameState.upgrades.hookCount;
  document.getElementById('incomeLevelDisplay').textContent = 'Lvl ' + (gameState.upgrades.incomePerSecond + 1);
  document.getElementById('rateLevelDisplay').textContent = 'Lvl ' + (Math.round((gameState.upgrades.catchRate - 0.7) / 0.05) + 1);
  
  // Disable buttons if not enough coins
  document.getElementById('lineBtn').disabled = gameState.coins < lineCost;
  document.getElementById('hookBtn').disabled = gameState.coins < hookCost;
  document.getElementById('incomeBtn').disabled = gameState.coins < incomeCost;
  document.getElementById('rateBtn').disabled = gameState.coins < rateCost;
  
  // Update collection
  updateCollection();
}

// Update fish collection display
function updateCollection() {
  collectionList.innerHTML = '';
  
  const sortedFish = Object.values(gameState.collection).sort((a, b) => b.count - a.count);
  
  sortedFish.forEach(fish => {
    const item = document.createElement('div');
    item.className = 'fish-item';
    
    const rarityClass = `rarity-${fish.rarity}`;
    item.innerHTML = `
      <span>
        <span class="fish-name">${fish.emoji} ${fish.name}</span>
        <span class="fish-rarity ${rarityClass}">${fish.rarity}</span>
      </span>
      <span class="fish-value">×${fish.count}</span>
    `;
    
    collectionList.appendChild(item);
  });
  
  if (sortedFish.length === 0) {
    collectionList.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">Cast your line to catch fish!</div>';
  }
}

// Passive income
setInterval(() => {
  if (gameState.upgrades.incomePerSecond > 0) {
    gameState.coins += gameState.upgrades.incomePerSecond;
    updateUI();
    saveGame();
  }
}, 1000);

// Save game periodically
setInterval(() => {
  saveGame();
}, 5000);

// Button click handler
castBtn.addEventListener('click', handleCast);

// Start game
loadGame();
updateUI();
animate();

// Initial message
if (gameState.totalFishCaught === 0) {
  caughtText.textContent = 'Click CAST LINE to start fishing! 🎣';
  setTimeout(() => {
    caughtText.textContent = '';
  }, 3000);
}
