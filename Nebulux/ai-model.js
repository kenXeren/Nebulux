// Nebulux AI Model - TensorFlow.js Implementation
// This model trains on user gameplay data to provide personalized recommendations

// Load TensorFlow.js
document.addEventListener('DOMContentLoaded', function() {
  // Load TensorFlow.js script dynamically
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.11.0/dist/tf.min.js';
  script.async = true;
  script.onload = initializeAI;
  document.head.appendChild(script);
});

// Game data structure for training
const gameFeatures = {
  'Pixel Adventure': { action: 0.8, adventure: 0.7, puzzle: 0.2, rpg: 0.3, strategy: 0.1, simulation: 0.0, difficulty: 0.6 },
  'Space Explorer': { action: 0.5, adventure: 0.9, puzzle: 0.4, rpg: 0.6, strategy: 0.3, simulation: 0.2, difficulty: 0.5 },
  'Zombie Survival': { action: 0.9, adventure: 0.6, puzzle: 0.1, rpg: 0.4, strategy: 0.5, simulation: 0.1, difficulty: 0.8 },
  'Puzzle Master': { action: 0.1, adventure: 0.3, puzzle: 0.9, rpg: 0.2, strategy: 0.4, simulation: 0.1, difficulty: 0.7 },
  'Farm Simulator': { action: 0.0, adventure: 0.2, puzzle: 0.3, rpg: 0.1, strategy: 0.2, simulation: 0.9, difficulty: 0.3 },
  'Dragon Quest': { action: 0.7, adventure: 0.8, puzzle: 0.3, rpg: 0.9, strategy: 0.6, simulation: 0.2, difficulty: 0.7 },
  'Strategy Empire': { action: 0.3, adventure: 0.4, puzzle: 0.5, rpg: 0.6, strategy: 0.9, simulation: 0.4, difficulty: 0.8 },
  'Racing Champions': { action: 0.7, adventure: 0.4, puzzle: 0.1, rpg: 0.2, strategy: 0.5, simulation: 0.6, difficulty: 0.6 },
  'AI Adventure': { action: 0.6, adventure: 0.8, puzzle: 0.5, rpg: 0.7, strategy: 0.6, simulation: 0.3, difficulty: 0.5 },
  'Puzzle AI': { action: 0.1, adventure: 0.4, puzzle: 0.9, rpg: 0.3, strategy: 0.7, simulation: 0.2, difficulty: 0.6 }
};

// Game tutorials and gameplay tips
const gameTutorials = {
  'Pixel Adventure': [
    'Use WASD or arrow keys to move your character',
    'Jump with the spacebar and double-jump by pressing it twice',
    'Collect gems to unlock special abilities',
    'Enemies can be defeated by jumping on them',
    'Save your progress at checkpoints marked by flags'
  ],
  'Space Explorer': [
    'WASD controls your spaceship movement',
    'Left-click to fire your primary weapon',
    'Right-click to deploy shields (limited energy)',
    'Collect blue orbs to replenish energy',
    'Explore nebulas to discover hidden planets'
  ],
  'Zombie Survival': [
    'WASD to move, Shift to sprint (limited stamina)',
    'Left-click to attack, right-click to block',
    'Press E to interact with objects and survivors',
    'Craft weapons at workbenches using collected materials',
    'Maintain health, hunger, and thirst to survive'
  ],
  'Puzzle Master': [
    'Click or tap tiles to move them',
    'Complete patterns to progress to next level',
    'Time bonuses are awarded for quick solutions',
    'Use hint tokens sparingly - they're limited',
    'Some puzzles have hidden solutions - look for visual clues'
  ],
  'Farm Simulator': [
    'Click plots of land to prepare for planting',
    'Drag seeds from inventory to prepared soil',
    'Water plants daily with the watering can (W key)',
    'Harvest crops when they're fully grown',
    'Sell produce at the market for coins to expand your farm'
  ],
  'Dragon Quest': [
    'WASD to move, Spacebar to jump',
    'Left-click for primary attack, right-click for special ability',
    'Press F to interact with NPCs and objects',
    'Open inventory with E to equip items and weapons',
    'Complete quests to earn XP and gold'
  ],
  'Strategy Empire': [
    'Right-click to select units, left-click to command them',
    'Build resource collectors early to fund your empire',
    'Research technologies to unlock advanced units',
    'Use scouts to reveal the map and enemy positions',
    'Defend your base while expanding territory'
  ],
  'Racing Champions': [
    'WASD or arrow keys to control your vehicle',
    'Spacebar for handbrake (drifting around corners)',
    'Collect nitro boosters and activate with Shift',
    'Perform stunts while airborne for speed boosts',
    'Unlock new vehicles by winning tournaments'
  ],
  'AI Adventure': [
    'Use WASD or arrow keys to move your character',
    'Avoid red enemies that chase you',
    'Your score increases the longer you survive',
    'No weapons - focus on evasion and strategy',
    'The game gets progressively harder as your score increases'
  ],
  'Puzzle AI': [
    'Click tiles adjacent to the empty space to move them',
    'Arrange numbers in ascending order to win',
    'Try to solve the puzzle in as few moves as possible',
    'Look several moves ahead to plan your strategy',
    'The timer tracks how long you take to solve the puzzle'
  ]
};

// Store high scores
let gameHighScores = {};

// AI model and related variables
let model;
let userPreferences = {
  action: 0.5,
  adventure: 0.5,
  puzzle: 0.5,
  rpg: 0.5,
  strategy: 0.5,
  simulation: 0.5,
  preferredDifficulty: 0.5
};

// Initialize the AI system
function initializeAI() {
  console.log('TensorFlow.js loaded, initializing AI system...');
  
  // Load existing user data
  loadUserData();
  
  // Create model
  createModel();
  
  // Add AI panel to the page
  createAIPanel();
}

// Load user gameplay data from localStorage
function loadUserData() {
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  if (currentUser) {
    // Load game preferences if they exist
    if (localStorage.getItem(`${currentUser.email}_preferences`)) {
      userPreferences = JSON.parse(localStorage.getItem(`${currentUser.email}_preferences`));
    }
    
    // Load high scores if they exist
    if (localStorage.getItem(`${currentUser.email}_highScores`)) {
      gameHighScores = JSON.parse(localStorage.getItem(`${currentUser.email}_highScores`));
    } else {
      // Initialize with default scores
      gameHighScores = {
        'AI Adventure': 0,
        'Puzzle AI': 0
      };
      localStorage.setItem(`${currentUser.email}_highScores`, JSON.stringify(gameHighScores));
    }
    
    // Initialize play history if doesn't exist
    if (!localStorage.getItem(`${currentUser.email}_playHistory`)) {
      localStorage.setItem(`${currentUser.email}_playHistory`, JSON.stringify([]));
    }
  }
}

// Create TensorFlow.js model
function createModel() {
  try {
    // Create a simple neural network model
    model = tf.sequential();
    
    // Input layer with 7 features (game attributes)
    model.add(tf.layers.dense({
      units: 10,
      activation: 'relu',
      inputShape: [7]
    }));
    
    // Hidden layer
    model.add(tf.layers.dense({
      units: 10,
      activation: 'relu'
    }));
    
    // Output layer (prediction of how much user will enjoy game)
    model.add(tf.layers.dense({
      units: 1,
      activation: 'sigmoid'
    }));
    
    // Compile the model
    model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError'
    });
    
    console.log('AI model created successfully');
    
    // Train model with existing data if available
    trainModel();
  } catch (error) {
    console.error('Error creating AI model:', error);
  }
}

// Train the model with available user data
function trainModel() {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const playHistory = JSON.parse(localStorage.getItem(`${currentUser.email}_playHistory`)) || [];
    
    // Need at least some play history to train
    if (playHistory.length < 2) {
      console.log('Not enough play history to train model');
      return;
    }
    
    console.log('Training model with play history...');
    
    // Prepare training data
    const inputs = [];
    const outputs = [];
    
    playHistory.forEach(entry => {
      if (!gameFeatures[entry.game]) return;
      
      // Create input features array
      const features = [
        gameFeatures[entry.game].action,
        gameFeatures[entry.game].adventure,
        gameFeatures[entry.game].puzzle,
        gameFeatures[entry.game].rpg,
        gameFeatures[entry.game].strategy,
        gameFeatures[entry.game].simulation,
        gameFeatures[entry.game].difficulty
      ];
      
      inputs.push(features);
      outputs.push([entry.enjoyment]); // Normalized enjoyment score
    });
    
    if (inputs.length === 0) return;
    
    // Convert to tensors
    const xs = tf.tensor2d(inputs);
    const ys = tf.tensor2d(outputs);
    
    // Train the model
    model.fit(xs, ys, {
      epochs: 50,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
        },
        onTrainEnd: () => {
          console.log('Model training complete');
          // Update recommendations
          updateGameRecommendations();
        }
      }
    });
  } catch (error) {
    console.error('Error training model:', error);
  }
}

// Update user preferences based on gameplay
function updateUserPreferences(game, enjoyment, timePlayed) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;
  
  // Get game features
  const gameAttrs = gameFeatures[game];
  if (!gameAttrs) return;
  
  // Update user preferences (weighted average with new gameplay data)
  const weight = Math.min(timePlayed / 60, 1) * 0.2; // Weight based on play time, max 0.2
  
  userPreferences.action = userPreferences.action * (1 - weight) + gameAttrs.action * weight;
  userPreferences.adventure = userPreferences.adventure * (1 - weight) + gameAttrs.adventure * weight;
  userPreferences.puzzle = userPreferences.puzzle * (1 - weight) + gameAttrs.puzzle * weight;
  userPreferences.rpg = userPreferences.rpg * (1 - weight) + gameAttrs.rpg * weight;
  userPreferences.strategy = userPreferences.strategy * (1 - weight) + gameAttrs.strategy * weight;
  userPreferences.simulation = userPreferences.simulation * (1 - weight) + gameAttrs.simulation * weight;
  
  // Save updated preferences
  localStorage.setItem(`${currentUser.email}_preferences`, JSON.stringify(userPreferences));
  
  // Add to play history
  const playHistory = JSON.parse(localStorage.getItem(`${currentUser.email}_playHistory`)) || [];
  playHistory.push({
    game: game,
    timestamp: new Date().toISOString(),
    timePlayed: timePlayed,
    enjoyment: enjoyment
  });
  
  // Keep only last 50 entries
  if (playHistory.length > 50) {
    playHistory.shift();
  }
  
  localStorage.setItem(`${currentUser.email}_playHistory`, JSON.stringify(playHistory));
  
  // Retrain model with new data
  trainModel();
}

// Get game recommendations for current user
function getRecommendations() {
  try {
    if (!model) return [];
    
    const gameNames = Object.keys(gameFeatures);
    const predictions = [];
    
    // Make predictions for each game
    gameNames.forEach(game => {
      const features = [
        gameFeatures[game].action,
        gameFeatures[game].adventure,
        gameFeatures[game].puzzle,
        gameFeatures[game].rpg,
        gameFeatures[game].strategy,
        gameFeatures[game].simulation,
        gameFeatures[game].difficulty
      ];
      
      // Predict enjoyment
      const input = tf.tensor2d([features]);
      const prediction = model.predict(input);
      const score = prediction.dataSync()[0];
      
      predictions.push({
        game: game,
        score: score
      });
      
      input.dispose();
      prediction.dispose();
    });
    
    // Sort by predicted enjoyment score
    predictions.sort((a, b) => b.score - a.score);
    
    return predictions;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
}

// Get game tutorials and tips
function getGameTutorial(game) {
  return gameTutorials[game] || [];
}

// Record game score
function recordGameScore(game, score) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;
  
  // Update high score if higher
  if (!gameHighScores[game] || score > gameHighScores[game]) {
    gameHighScores[game] = score;
    localStorage.setItem(`${currentUser.email}_highScores`, JSON.stringify(gameHighScores));
  }
}

// Create AI recommendation panel
function createAIPanel() {
  // Create floating AI button
  const aiButton = document.createElement('div');
  aiButton.className = 'fixed bottom-6 right-6 bg-accent text-black rounded-full w-16 h-16 flex items-center justify-center shadow-lg cursor-pointer z-50 hover:scale-110 transition-transform';
  aiButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  `;
  document.body.appendChild(aiButton);
  
  // Create panel (initially hidden)
  const aiPanel = document.createElement('div');
  aiPanel.className = 'fixed bottom-24 right-6 w-80 bg-secondary rounded-lg shadow-xl p-4 transform scale-0 origin-bottom-right transition-transform duration-300 z-50';
  aiPanel.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-bold text-accent">Game AI Assistant</h3>
      <button class="text-white hover:text-accent">×</button>
    </div>
    <div class="ai-panel-content overflow-y-auto max-h-96"></div>
  `;
  document.body.appendChild(aiPanel);
  
  // Toggle panel visibility
  aiButton.addEventListener('click', () => {
    if (aiPanel.style.transform === 'scale(1)') {
      aiPanel.style.transform = 'scale(0)';
    } else {
      aiPanel.style.transform = 'scale(1)';
      updateAIPanelContent();
    }
  });
  
  // Close button
  aiPanel.querySelector('button').addEventListener('click', () => {
    aiPanel.style.transform = 'scale(0)';
  });
  
  // Update initial content
  updateAIPanelContent();
}

// Update AI panel content with recommendations
function updateAIPanelContent() {
  const panelContent = document.querySelector('.ai-panel-content');
  if (!panelContent) return;
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    panelContent.innerHTML = `
      <p class="text-center py-4">Please log in to get personalized game recommendations.</p>
    `;
    return;
  }
  
  // Check if model is ready
  if (!model) {
    panelContent.innerHTML = `
      <div class="text-center py-4">
        <p class="mb-2">AI model is initializing...</p>
        <div class="loader mx-auto"></div>
      </div>
    `;
    return;
  }
  
  // Get recommendations
  const recommendations = getRecommendations();
  
  // Display user stats
  const stats = currentUser.stats || { level: 1, xp: 0, gamesCompleted: 0 };
  
  let content = `
    <div class="mb-4 p-3 bg-black bg-opacity-30 rounded">
      <p class="text-sm text-accent font-bold">Hello, ${currentUser.username}!</p>
      <p class="text-xs opacity-70">Level ${stats.level} • ${stats.xp} XP</p>
    </div>
    
    <h4 class="font-bold mb-2">Recommended Games</h4>
    <div class="space-y-2 mb-4">
  `;
  
  // Add recommendations
  recommendations.slice(0, 3).forEach(rec => {
    content += `
      <div class="flex items-center justify-between bg-black bg-opacity-20 p-2 rounded">
        <div>
          <p class="font-medium">${rec.game}</p>
          <div class="w-24 h-1 bg-gray-700 rounded-full mt-1">
            <div class="h-1 bg-accent rounded-full" style="width: ${Math.round(rec.score * 100)}%"></div>
          </div>
        </div>
        <button class="text-xs bg-accent text-black px-2 py-1 rounded play-game-btn" data-game="${rec.game.toLowerCase().replace(/\s+/g, '-')}">
          Play
        </button>
      </div>
    `;
  });
  
  // Add high scores section
  content += `
    </div>
    
    <h4 class="font-bold mb-2">Your High Scores</h4>
    <div class="space-y-2 mb-4">
  `;
  
  // Add high scores
  const highScoreEntries = Object.entries(gameHighScores);
  if (highScoreEntries.length > 0) {
    highScoreEntries.forEach(([game, score]) => {
      content += `
        <div class="flex items-center justify-between bg-black bg-opacity-20 p-2 rounded">
          <p class="font-medium">${game}</p>
          <p class="text-accent font-bold">${score}</p>
        </div>
      `;
    });
  } else {
    content += `<p class="text-sm opacity-70 text-center py-2">No games played yet</p>`;
  }
  
  // Add game tips section
  content += `
    </div>
    
    <h4 class="font-bold mb-2">Game Tips</h4>
    <div class="game-tips bg-black bg-opacity-20 p-3 rounded text-sm">
      <p class="text-center opacity-70">Select a game to see tips</p>
    </div>
  `;
  
  panelContent.innerHTML = content;
  
  // Add event listeners for play buttons
  document.querySelectorAll('.play-game-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const gameId = btn.getAttribute('data-game');
      launchGame(gameId);
      
      // Show tips for this game
      const gameName = btn.closest('div').querySelector('p').textContent;
      showGameTips(gameName);
    });
  });
}

// Show tips for a specific game
function showGameTips(game) {
  const tipsContainer = document.querySelector('.game-tips');
  if (!tipsContainer) return;
  
  const tips = getGameTutorial(game);
  
  if (tips && tips.length > 0) {
    let tipsHtml = `
      <p class="font-bold mb-2">${game} - How to Play:</p>
      <ul class="list-disc list-inside space-y-1">
    `;
    
    tips.forEach(tip => {
      tipsHtml += `<li>${tip}</li>`;
    });
    
    tipsHtml += `</ul>`;
    tipsContainer.innerHTML = tipsHtml;
  } else {
    tipsContainer.innerHTML = `<p class="text-center opacity-70">No tips available for ${game}</p>`;
  }
}

// Update game recommendations display
function updateGameRecommendations() {
  updateAIPanelContent();
}

// Game launch handler with AI integration
window.launchGameWithAI = function(gameId) {
  // Start timer to track play time
  const startTime = Date.now();
  
  // Launch the game
  launchGame(gameId);
  
  // Set up listener for game end
  document.addEventListener('gameEnded', function gameEndHandler(e) {
    // Calculate play time in minutes
    const playTime = (Date.now() - startTime) / 1000 / 60;
    
    // Get enjoyment rating and score
    const enjoyment = e.detail.enjoyment || 0.5; // 0-1 scale
    const score = e.detail.score || 0;
    
    // Record data
    const gameName = idToGameName(gameId);
    updateUserPreferences(gameName, enjoyment, playTime);
    recordGameScore(gameName, score);
    
    // Remove event listener
    document.removeEventListener('gameEnded', gameEndHandler);
  });
}

// Helper function to convert game ID to name
function idToGameName(id) {
  const nameMap = {
    'ai-adventure': 'AI Adventure',
    'puzzle-ai': 'Puzzle AI',
    'pixel-adventure': 'Pixel Adventure',
    'space-explorer': 'Space Explorer',
    'zombie-survival': 'Zombie Survival',
    'puzzle-master': 'Puzzle Master',
    'farm-simulator': 'Farm Simulator',
    'dragon-quest': 'Dragon Quest',
    'strategy-empire': 'Strategy Empire',
    'racing-champions': 'Racing Champions'
  };
  
  return nameMap[id] || id;
}

// Add styles
const style = document.createElement('style');
style.textContent = `
  .loader {
    border: 3px solid rgba(255, 215, 0, 0.2);
    border-top: 3px solid #ffd700;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// Export functions for use in main script
window.nebuluxAI = {
  recordGameScore,
  getGameTutorial,
  updateUserPreferences
}; 