class BitsRushGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // UI Elements
    this.scoreEl = document.querySelector('#score .ui-text');
    this.comboEl = document.querySelector('#combo .ui-text');
    this.livesEl = document.querySelector('#lives .ui-text');
    this.messageBox = document.getElementById('message-box');
    this.messageText = document.getElementById('message-text');
    this.startScreen = document.getElementById('start-screen');
    this.startButton = document.getElementById('start-button');
    this.endScreen = document.getElementById('end-screen');
    this.retryButton = document.getElementById('retry-button');
    this.finalScoreEl = document.getElementById('final-score');
    this.maxComboEl = document.getElementById('max-combo');
    this.finalMascot = document.getElementById('final-mascot');
    this.finalMascotImg = document.getElementById('final-mascot-img');
    this.openManual = document.getElementById('open-manual');
    this.closeManual = document.getElementById('close-manual');
    this.manualModal = document.getElementById('manual-modal');

    // Game State
    this.gameState = {
      score: 0,
      combo: 0,
      maxCombo: 0,
      lives: 3,
      gameOver: false,
      gameStarted: false,
      frameCount: 0,
      difficulty: 1,
      level: 1
    };

    // Game Objects
    this.robot = new Robot();
    this.obstacles = [];
    this.items = [];
    this.particles = [];
    this.comboTimeout = null;

    // Asset paths
    this.assetPaths = {
      runSprites: [
        'assets/robot/robo2correndo2.PNG',
        'assets/robot/robo2correndo3.PNG',
        'assets/robot/robo2correndo4.PNG',
        'assets/robot/robo2correndo5.PNG'
      ],
      jumpSprite: 'assets/robot/robo2pulando.PNG',
      finalSprites: [
        'assets/robot/robo2final1.PNG',
        'assets/robot/robo2final2.PNG',
        'assets/robot/robo2final3.PNG',
        'assets/robot/robo2final4.PNG'
      ]
    };

    // Game configurations
    this.config = {
      gravity: 0.8,
      jumpForce: -15,
      groundOffset: 40,
      spawnRates: {
        obstacle: 0.015,
        item: 0.008
      },
      maxEntities: {
        obstacles: 4,
        items: 3
      },
      speeds: {
        obstacle: 6,
        item: 7
      }
    };

    this.obstacleTypes = [
      { emoji: '🐞', name: 'Bug', color: '#ff0044', damage: 1 },
      { emoji: '🚫', name: 'Erro 404', color: '#ff0055', damage: 1 },
      { emoji: '📱', name: 'Distração', color: '#ff3366', damage: 1 }
    ];

    this.itemTypes = [
      { emoji: '💡', name: 'Lógica de Programação', points: 15, message: 'Lógica de Programação!' },
      { emoji: '🧠', name: 'Raciocínio Lógico', points: 20, message: 'Raciocínio Lógico!' },
      { emoji: '📚', name: 'Estrutura de Dados', points: 25, message: 'Estrutura de Dados!' },
      { emoji: '🗄️', name: 'Banco de Dados', points: 18, message: 'Banco de Dados!' },
      { emoji: '🔢', name: 'Matemática', points: 17, message: 'Matemática!' },
      { emoji: '📐', name: 'Algoritmos', points: 22, message: 'Algoritmos!' },
      { emoji: '🌐', name: 'Redes de Computadores', points: 19, message: 'Redes de Computadores!' },
      { emoji: '🛠️', name: 'Engenharia de Software', points: 21, message: 'Engenharia de Software!' }
    ];

    // Mensagens humoradas para colisão com bugs
    this.bugMessages = [
      'O código bugou! 💥',
      'Deu tela azul! 😵',
      'Bug detectado! 🐞',
      'Erro 404: habilidade não encontrada! 🚫',
      'O robô tropeçou no bug! 🤖🐛',
      'Stack overflow! 🥴',
      'Exceção não tratada! ⚠️',
      'O compilador ficou confuso! 🤔',
      'O robô travou! 🧊',
      'Bugou geral! 🤖'
    ];

    this.itemMessages = {
      'Lógica de Programação': [
        'Você pensou como um computador! 💡',
        'Lógica afiada, mente brilhante! 🤓',
        'Desvendou o enigma do código! 🔍',
        'Programador raiz detectado! 👾'
      ],
      'Raciocínio Lógico': [
        'Raciocínio de mestre! 🧠',
        'Você conectou os pontos! 🔗',
        'Que mente lógica! 🧩',
        'Desafio lógico vencido! 🏆',
        'Variavel de sucesso! 📈'
      ],
      'Estrutura de Dados': [
        'Organização é tudo! 📚',
        'Você empilhou conhecimento! 🥞',
        'Árvore binária? Fácil! 🌳',
        'Listou mais uma vitória! 📋'
      ],
      'Banco de Dados': [
        'Você fez uma consulta perfeita! 📊',
        'Query perfeita! 🔎',
        'Dados salvos com sucesso! 💾',
        'SQL Master! 🥇'
      ],
      'Matemática': [
        'Calculou a vitória! 🔢',
        'Matemágica ativada! ✨',
        'Equação resolvida! ➗',
        'Você somou pontos! ➕'
      ],
      'Algoritmos': [
        'Algoritmo eficiente! 📐',
        'Você otimizou o jogo! 🚀',
        'Passo a passo para o sucesso! 👣',
        'Loop infinito de vitórias! 🔁'
      ],
      'Redes de Computadores': [
        'Conexão estável! 🌐',
        'Ping baixíssimo! 🏓',
        'Você roteou para o sucesso! 📡',
        'Pacote de vitória entregue! 📦'
      ],
      'Engenharia de Software': [
        'Engenharia de campeões! 🛠️',
        'Você arquitetou a vitória! 🏗️',
        'Código limpo! 🧹',
        'Deploy feito! 🚀'
      ]
    };

    this.timerEl = null;
    this.remainingTimeEl = null;
    this.messageHistory = [];

    this.init();
  }

  async init() {
    await this.loadAssets();
    this.setupEventListeners();
    this.resizeCanvas();
    this.resetGame();
    this.startGameLoop();
    setTimeout(() => {
      // Adiciona evento para fechar mensagem manualmente
      const closeBtn = document.getElementById('close-message');
      if (closeBtn) {
        closeBtn.onclick = () => this.hideMessage();
      }
      // Mostra histórico ao clicar no balão
      this.messageBox.onclick = (e) => {
        if (e.target === closeBtn) return;
        this.messageBox.classList.toggle('show-history');
      };
    }, 500);
  }

  async loadAssets() {
    try {
      console.log('Carregando sprites finais:', this.assetPaths.finalSprites);
      this.robot.runSprites = await Promise.all(
        this.assetPaths.runSprites.map(path => this.loadImage(path))
      );
      this.robot.jumpSprite = await this.loadImage(this.assetPaths.jumpSprite);
      this.robot.finalSprites = (await Promise.all(
        this.assetPaths.finalSprites.map(path => this.loadImage(path))
      )).filter(img => img); // Filtra imagens nulas
      console.log('Sprites finais carregados:', this.robot.finalSprites);
      // Carregar sons
      this.sounds = {
        jump: new Audio('assets/sounds/jump.wav'),
        collect: new Audio('assets/sounds/collect.wav'),
        hit: new Audio('assets/sounds/hit.wav')
      };
      // Música de fundo
      this.music = new Audio('assets/sounds/music.mp3');
      this.music.loop = true;
    } catch (error) {
      console.warn('Some assets failed to load:', error);
    }
  }

  loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.warn(`Failed to load image: ${src}`);
        resolve(null);
      };
      img.src = src;
    });
  }

  setupEventListeners() {
    // Start button
    this.startButton.addEventListener('click', () => this.startGame());
    
    // Retry button
    this.retryButton.addEventListener('click', () => this.restartGame());
    
    // Keyboard controls
    window.addEventListener('keydown', (e) => this.handleKeydown(e));
    
    // Touch controls for mobile
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleJump();
    });
    
    // Manual modal
    this.openManual.addEventListener('click', () => {
      this.manualModal.classList.remove('hidden');
    });
    
    this.closeManual.addEventListener('click', () => {
      this.manualModal.classList.add('hidden');
    });
    
    // Canvas focus for keyboard input
    this.canvas.addEventListener('click', () => {
      this.canvas.focus();
    });
    
    // Resize handler
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  handleKeydown(e) {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      
      if (!this.gameState.gameStarted && !this.gameState.gameOver) {
        this.startGame();
      } else if (this.gameState.gameOver) {
        this.restartGame();
      } else if (this.gameState.gameStarted && !this.gameState.gameOver) {
        this.handleJump();
      }
    }
  }

  handleJump() {
    if (!this.robot.isJumping && this.gameState.gameStarted && !this.gameState.gameOver) {
      this.robot.jump();
      this.createJumpParticles();
      this.playSound('jump');
    }
  }

  createJumpParticles() {
    for (let i = 0; i < 5; i++) {
      this.particles.push(new Particle(
        this.robot.x + this.robot.width / 2,
        this.robot.y + this.robot.height,
        (Math.random() - 0.5) * 4,
        -Math.random() * 3,
        '#00fff7'
      ));
    }
  }

  resizeCanvas() {
    const container = document.getElementById('game-container');
    const maxWidth = Math.min(window.innerWidth * 0.95, 900);
    const maxHeight = Math.max(window.innerHeight * 0.4, 200);
    
    this.canvas.width = maxWidth;
    this.canvas.height = maxHeight;
    
    // Update robot size proportionally
    this.robot.updateSize(this.canvas.height);
    this.robot.resetPosition(this.getGroundY());
    
    // Update config based on canvas size
    this.config.gravity = this.canvas.height * 0.001;
    this.config.jumpForce = -this.canvas.height * 0.015; // Pulo ainda mais baixo
  }

  getGroundY() {
    return this.canvas.height - this.robot.height - this.config.groundOffset;
  }

  resetGame() {
    this.gameState = {
      score: 0,
      combo: 0,
      maxCombo: 0,
      lives: 3,
      gameOver: false,
      gameStarted: false,
      frameCount: 0,
      difficulty: 1,
      level: 1
    };
    
    this.obstacles.length = 0;
    this.items.length = 0;
    this.particles.length = 0;
    
    this.robot.reset(this.getGroundY());
    
    this.updateUI();
    this.endScreen.classList.add('hidden');
    this.hideMessage();
    this.messageHistory = [];
    this.updateMessageHistory();
  }

  startGame() {
    this.startScreen.style.display = 'none';
    this.gameState.gameStarted = true;
    this.canvas.focus();
    this.playMusic();
  }

  restartGame() {
    this.resetGame();
    this.startGame();
  }

  updateUI() {
    this.scoreEl.textContent = this.gameState.score.toLocaleString();
    this.comboEl.textContent = this.gameState.combo;
    this.livesEl.textContent = '❤️'.repeat(Math.max(0, this.gameState.lives));
  }

  showMessage(text, duration = 2000) {
    if (!this.messageBox) return;
    // Salva mensagem no histórico
    this.messageHistory.push(text);
    // Permite quebra de linha para nome da matéria e mensagem
    this.messageText.innerHTML = text.replace(/\n/g, '<br>');
    this.updateMessageHistory();
    this.messageBox.classList.add('show');
    clearTimeout(this.comboTimeout);
    this.comboTimeout = setTimeout(() => {
      this.hideMessage();
    }, duration);
  }

  hideMessage() {
    if (this.messageBox) {
      this.messageBox.classList.remove('show');
    }
  }

  updateMessageHistory() {
    const historyEl = document.getElementById('message-history');
    if (historyEl) {
      historyEl.innerHTML = this.messageHistory.map(msg => `<div class='history-msg'>${msg.replace(/\n/g, '<br>')}</div>`).join('');
    }
  }

  spawnObstacle() {
    if (this.obstacles.length >= this.config.maxEntities.obstacles) return;
    
    const type = this.obstacleTypes[Math.floor(Math.random() * this.obstacleTypes.length)];
    // Obstáculo no chão: base alinhada ao chão do robô
    const obstacleY = this.getGroundY() + (this.robot.height - 48); // 48 = altura do obstáculo
    const obstacle = new Obstacle(
      this.canvas.width + 10,
      obstacleY,
      type,
      this.config.speeds.obstacle * this.gameState.difficulty
    );
    
    this.obstacles.push(obstacle);
  }

  spawnItem() {
    if (this.items.length >= this.config.maxEntities.items) return;
    
    const type = this.itemTypes[Math.floor(Math.random() * this.itemTypes.length)];
    // Itens no ar: sorteia altura entre 1/3 e 2/3 da altura do canvas, acima do chão
    const minY = this.canvas.height / 3;
    const maxY = this.canvas.height * 2 / 3;
    const itemY = Math.random() * (maxY - minY) + minY - 32; // 32 = altura do item
    const item = new Item(
      this.canvas.width + 10,
      itemY,
      type,
      this.config.speeds.item * this.gameState.difficulty
    );
    
    this.items.push(item);
  }

  updateGameLogic() {
    if (!this.gameState.gameStarted || this.gameState.gameOver) return;
    
    // Dificuldade progressiva ainda mais suave para bugs
    this.gameState.difficulty = 1 + (this.gameState.frameCount / 3000); // aumenta mais devagar
    // Reduz ainda mais quantidade máxima de bugs
    this.config.maxEntities.obstacles = Math.min(3, 1 + Math.floor(this.gameState.difficulty));
    this.config.maxEntities.items = Math.min(6, 3 + Math.floor(this.gameState.difficulty / 2));
    // Reduz ainda mais spawn rate dos bugs
    this.config.spawnRates.obstacle = 0.004 + (this.gameState.difficulty * 0.001);
    this.config.spawnRates.item = 0.008 + (this.gameState.difficulty * 0.002);
    
    // Update difficulty and level
    this.gameState.difficulty = 1 + (this.gameState.frameCount / 3600) * 0.5;
    this.gameState.level = Math.floor(this.gameState.frameCount / 1800) + 1;
    
    // Update robot
    this.robot.update(this.getGroundY(), this.config.gravity);
    
    // Spawn entities
    if (Math.random() < this.config.spawnRates.obstacle * this.gameState.difficulty) {
      this.spawnObstacle();
    }
    
    if (Math.random() < this.config.spawnRates.item) {
      this.spawnItem();
    }
    
    // Update obstacles
    this.updateObstacles();
    
    // Update items
    this.updateItems();
    
    // Update particles
    this.updateParticles();
    
    this.gameState.frameCount++;
  }

  updateObstacles() {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.update();
      
      // Remove off-screen obstacles
      if (obstacle.x + obstacle.width < 0) {
        this.obstacles.splice(i, 1);
        continue;
      }
      
      // Check collision with robot
      if (this.checkCollision(this.robot, obstacle)) {
        this.obstacles.splice(i, 1);
        this.handleObstacleCollision(obstacle);
      }
    }
  }

  updateItems() {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.update();
      
      // Remove off-screen items
      if (item.x + item.width < 0) {
        this.items.splice(i, 1);
        continue;
      }
      
      // Check collision with robot
      if (this.checkCollision(this.robot, item)) {
        this.items.splice(i, 1);
        this.handleItemCollection(item);
      }
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.update();
      
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
  }

  handleObstacleCollision(obstacle) {
    this.gameState.lives -= obstacle.type.damage;
    this.gameState.combo = 0;
    this.updateUI();
    // Mensagem humorada aleatória
    const msg = this.bugMessages[Math.floor(Math.random() * this.bugMessages.length)];
    const materia = obstacle.type.name;
    this.showMessage(`${materia}\n${msg}`);
    this.playSound('hit');
    if (this.gameState.lives <= 0) {
      this.endGame();
    }
  }

  handleItemCollection(item) {
    const comboBonus = this.gameState.combo * 5;
    const totalPoints = item.type.points + comboBonus;
    this.gameState.score += totalPoints;
    this.gameState.combo++;
    if (this.gameState.combo > this.gameState.maxCombo) {
      this.gameState.maxCombo = this.gameState.combo;
    }
    this.createCollectionParticles(item.x, item.y);
    this.updateUI();
    // Mensagem motivadora divertida
    let msgArr = this.itemMessages[item.type.name] || [item.type.message];
    const motivMsg = msgArr[Math.floor(Math.random() * msgArr.length)];
    const materia = item.type.name;
    const message = comboBonus > 0 
      ? `${materia}\n${motivMsg} +${totalPoints} pts (Combo x${this.gameState.combo})`
      : `${materia}\n${motivMsg}`;
    this.showMessage(message);
    this.playSound('collect');
  }

  createCollectionParticles(x, y) {
    for (let i = 0; i < 6; i++) {
      this.particles.push(new Particle(
        x + 16,
        y + 16,
        (Math.random() - 0.5) * 6,
        -Math.random() * 4,
        '#00fff7'
      ));
    }
  }

  drawBackground() {
    // Gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#232946');
    gradient.addColorStop(1, '#181c2b');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Ground
    this.ctx.fillStyle = '#00fff7';
    this.ctx.fillRect(0, this.canvas.height - 20, this.canvas.width, 8);
    
    // Ground lines
    for (let i = 0; i < 6; i++) {
      this.ctx.strokeStyle = `rgba(0,255,247,${0.1 + 0.1 * i})`;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(0, this.canvas.height - 60 + i * 6);
      this.ctx.lineTo(this.canvas.width, this.canvas.height - 60 + i * 6);
      this.ctx.stroke();
    }
    
    // Scrolling background elements
    this.drawScrollingElements();
  }

  drawScrollingElements() {
    const speed = 2;
    const offset = (this.gameState.frameCount * speed) % 100;
    
    this.ctx.fillStyle = 'rgba(0,255,247,0.1)';
    for (let i = -1; i < this.canvas.width / 100 + 2; i++) {
      this.ctx.fillRect(i * 100 - offset, this.canvas.height - 30, 2, 10);
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (!this.gameState.gameStarted) {
      this.drawBackground();
      this.drawStartMessage();
      return;
    }
    
    this.drawBackground();
    
    // Draw game objects
    this.robot.draw(this.ctx, this.gameState.gameOver);
    
    this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));
    this.items.forEach(item => item.draw(this.ctx));
    this.particles.forEach(particle => particle.draw(this.ctx));
    
    // Draw HUD
    this.drawHUD();
  }

  drawStartMessage() {
    this.ctx.fillStyle = '#00fff7';
    this.ctx.font = 'bold 24px Inter';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Pressione ESPAÇO para começar', this.canvas.width / 2, this.canvas.height / 2);
  }

  drawHUD() {
    // Level indicator
    this.ctx.fillStyle = '#00fff7';
    this.ctx.font = '16px Inter';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Nível ${this.gameState.level}`, 20, 30);
    
    // Difficulty indicator
    this.ctx.fillText(`Dificuldade: ${this.gameState.difficulty.toFixed(1)}x`, 20, 50);
  }

  endGame() {
    this.gameState.gameOver = true;
    this.manualModal.classList.add('hidden');
    this.showEndScreen();
    this.stopMusic();
  }

  showEndScreen() {
    this.finalScoreEl.textContent = this.gameState.score.toLocaleString();
    this.maxComboEl.textContent = this.gameState.maxCombo;
    
    // Animate final mascot
    this.animateFinalMascot();
    
    this.endScreen.classList.remove('hidden');
  }

  animateFinalMascot() {
    // Suaviza o loop: faz ida e volta (ping-pong) na animação
    if (!this.endScreen.classList.contains('hidden') && this.robot.finalSprites.length > 0 && this.finalMascotImg) {
      const sprite = this.robot.finalSprites[this.robot.finalFrame];
      this.finalMascotImg.src = sprite ? sprite.src : this.assetPaths.finalSprites[0];
      // Atualiza frame para animação ping-pong
      this.robot.updateFinalAnimationPingPong();
      setTimeout(() => this.animateFinalMascot(), this.robot.finalFrameInterval * 2); // Mais lento e perceptível
    } else {
      console.warn('Não foi possível animar o mascote final:', {
        endScreenHidden: this.endScreen.classList.contains('hidden'),
        finalSpritesLength: this.robot.finalSprites.length,
        finalMascotImg: !!this.finalMascotImg
      });
    }
  }

  startGameLoop() {
    const gameLoop = () => {
      this.updateGameLogic();
      this.render();

      // Continue o loop enquanto a janela estiver ativa
      requestAnimationFrame(gameLoop);
    };
    
    // Inicia o primeiro frame do loop
    requestAnimationFrame(gameLoop);
  }

  // Sons e música
  playSound(name) {
    if (!this.sounds) return;
    const audio = this.sounds[name];
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
  }

  playMusic() {
    if (this.music && this.music.paused) {
      this.music.currentTime = 0;
      this.music.play();
    }
  }

  stopMusic() {
    if (this.music && !this.music.paused) {
      this.music.pause();
      this.music.currentTime = 0;
    }
  }
}

// Robot class
class Robot {
  constructor() {
    this.x = 80;
    this.y = 0;
    this.width = 80;
    this.height = 80;
    this.vy = 0;
    this.isJumping = false;
    this.frame = 0;
    this.frameTimer = 0;
    this.frameInterval = 8;
    this.finalFrame = 0;
    this.finalFrameTimer = 0;
    this.finalFrameInterval = 12;
    
    this.runSprites = [];
    this.jumpSprite = null;
    this.finalSprites = [];
  }

  updateSize(canvasHeight) {
    this.height = Math.max(100, Math.floor(canvasHeight * 0.25)); // Aumenta tamanho mínimo e percentual
    this.width = this.height;
  }

  resetPosition(groundY) {
    this.y = groundY;
    this.vy = 0;
    this.isJumping = false;
    this.frame = 0;
    this.frameTimer = 0;
  }

  reset(groundY) {
    this.resetPosition(groundY);
    this.finalFrame = 0;
    this.finalFrameTimer = 0;
  }

  jump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.vy = -15;
    }
  }

  update(groundY, gravity) {
    if (this.isJumping) {
      this.vy += gravity;
      this.y += this.vy;
      
      if (this.y >= groundY) {
        this.y = groundY;
        this.vy = 0;
        this.isJumping = false;
        this.frame = 0;
        this.frameTimer = 0;
      }
    } else {
      // Running animation
      this.frameTimer++;
      if (this.frameTimer >= this.frameInterval) {
        this.frame = (this.frame + 1) % this.runSprites.length;
        this.frameTimer = 0;
      }
    }
  }

  updateFinalAnimation() {
    this.finalFrameTimer++;
    if (this.finalFrameTimer >= this.finalFrameInterval) {
      this.finalFrame = (this.finalFrame + 1) % this.finalSprites.length;
      this.finalFrameTimer = 0;
    }
  }

  updateFinalAnimationSmooth() {
    // Animação ping-pong: 1-2-3-4-3-2-1-2-3-4...
    if (!this._pingpongDir) this._pingpongDir = 1;
    if (typeof this.finalFrame === 'undefined') this.finalFrame = 0;
    if (typeof this.finalFrameTimer === 'undefined') this.finalFrameTimer = 0;
    this.finalFrameTimer++;
    if (this.finalFrameTimer >= this.finalFrameInterval) {
      this.finalFrame += this._pingpongDir;
      if (this.finalFrame >= this.finalSprites.length - 1 || this.finalFrame <= 0) {
        this._pingpongDir *= -1;
      }
      this.finalFrameTimer = 0;
    }
  }

  updateFinalAnimationPingPong() {
    // Animação ping-pong: 0-1-2-3-2-1-0-1-2-3...
    if (typeof this._pingpongDir === 'undefined') this._pingpongDir = 1;
    if (typeof this.finalFrame === 'undefined') this.finalFrame = 0;
    if (typeof this.finalFrameTimer === 'undefined') this.finalFrameTimer = 0;
    this.finalFrame += this._pingpongDir;
    if (this.finalFrame >= this.finalSprites.length - 1) {
      this.finalFrame = this.finalSprites.length - 1;
      this._pingpongDir = -1;
    } else if (this.finalFrame <= 0) {
      this.finalFrame = 0;
      this._pingpongDir = 1;
    }
  }

  draw(ctx, gameOver) {
    if (gameOver && this.finalSprites.length > 0 && this.finalSprites[this.finalFrame]) {
      ctx.drawImage(this.finalSprites[this.finalFrame], this.x, this.y, this.width, this.height);
    } else if (this.isJumping && this.jumpSprite) {
      ctx.drawImage(this.jumpSprite, this.x, this.y, this.width, this.height);
    } else if (this.runSprites.length > 0 && this.runSprites[this.frame]) {
      ctx.drawImage(this.runSprites[this.frame], this.x, this.y, this.width, this.height);
    } else {
      // Fallback rectangle if sprites fail to load
      ctx.fillStyle = '#00fff7';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}

// Obstacle class
class Obstacle {
  constructor(x, y, type, speed) {
    this.x = x;
    this.y = y;
    this.width = 48;
    this.height = 48;
    this.type = type;
    this.speed = speed;
  }

  update() {
    this.x -= this.speed;
  }

  draw(ctx) {
    if (this.type.emoji) {
      ctx.font = '40px Arial';
      ctx.fillText(this.type.emoji, this.x, this.y + this.height - 8);
    }
  }
}

// Item class
class Item {
  constructor(x, y, type, speed) {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.type = type;
    this.speed = speed;
    this.bounce = 0;
  }

  update() {
    this.x -= this.speed;
    this.bounce += 0.2;
  }

  draw(ctx) {
    const bounceOffset = Math.sin(this.bounce) * 3;
    ctx.font = '32px Arial';
    ctx.fillText(this.type.emoji, this.x, this.y + this.height - 8 + bounceOffset);
  }
}

// Particle class
class Particle {
  constructor(x, y, vx, vy, color) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.life = 60;
    this.maxLife = 60;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.2; // gravity
    this.life--;
  }

  draw(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
    ctx.fillRect(this.x, this.y, 3, 3);
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.game = new BitsRushGame();
});