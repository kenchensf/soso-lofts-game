// Main Phaser 3 game logic for the SOSO Lofts bug-catching game
class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    // Track players
    this.players = [];
    // Inventory per player
    this.inventories = [];
    // Health per player
    this.health = [];
    // Bugs caught count
    this.bugsCaught = 0;
    // Total bugs in level
    this.totalBugs = 3;
  }

  preload() {
    // Background and environment
    this.load.image('background', 'assets/images/background.png');
    // Player frames
    this.load.image('p1_idle', 'assets/images/player1_idle_0.png');
    this.load.image('p1_walk0', 'assets/images/player1_walk_0.png');
    this.load.image('p1_walk1', 'assets/images/player1_walk_1.png');
    this.load.image('p2_idle', 'assets/images/player2_idle_0.png');
    this.load.image('p2_walk0', 'assets/images/player2_walk_0.png');
    this.load.image('p2_walk1', 'assets/images/player2_walk_1.png');
    // Items and UI
    this.load.image('stick', 'assets/images/stick.png');
    this.load.image('bag', 'assets/images/bag.png');
    this.load.image('jar', 'assets/images/jar.png');
    this.load.image('net', 'assets/images/net.png');
    this.load.image('heart', 'assets/images/heart.png');
    this.load.image('salve', 'assets/images/salve.png');
    // Bugs
    this.load.image('bug_a', 'assets/images/bug_a.png');
    this.load.image('bug_b', 'assets/images/bug_b.png');
    this.load.image('bug_c', 'assets/images/bug_c.png');
  }

  create() {
    // Add background
    this.add.image(0, 0, 'background').setOrigin(0, 0);
    // Setup world bounds
    this.physics.world.setBounds(0, 0, 640, 360);

    // Create players
    this.createPlayers();
    // Spawn items
    this.spawnItems();
    // Spawn bugs
    this.spawnBugs();
    // Spawn salve pickup
    this.spawnSalve();
    // Setup UI
    this.setupUI();
    // Setup input
    this.setupInput();
    // Setup on-screen touch controls
    this.setupTouchControls();
  }

  createPlayers() {
    // Player 1
    const p1 = this.physics.add.sprite(100, 260, 'p1_idle');
    p1.setCollideWorldBounds(true);
    this.players.push(p1);
    this.inventories.push({ stick: false, bag: false, net: false });
    this.health.push(3);
    // Player 2
    const p2 = this.physics.add.sprite(540, 260, 'p2_idle');
    p2.setCollideWorldBounds(true);
    this.players.push(p2);
    this.inventories.push({ stick: false, bag: false, net: false });
    this.health.push(3);
    // Animations
    this.anims.create({
      key: 'p1_idle_anim',
      frames: [{ key: 'p1_idle' }],
      frameRate: 1,
      repeat: -1,
    });
    this.anims.create({
      key: 'p1_walk_anim',
      frames: [ { key: 'p1_walk0' }, { key: 'p1_walk1' } ],
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: 'p2_idle_anim',
      frames: [{ key: 'p2_idle' }],
      frameRate: 1,
      repeat: -1,
    });
    this.anims.create({
      key: 'p2_walk_anim',
      frames: [ { key: 'p2_walk0' }, { key: 'p2_walk1' } ],
      frameRate: 6,
      repeat: -1,
    });
  }

  spawnItems() {
    // Stick item
    this.stick = this.physics.add.image(200, 280, 'stick').setScale(1).setOrigin(0.5, 0.5);
    this.stick.setImmovable(true);
    // Bag item
    this.bag = this.physics.add.image(440, 280, 'bag').setScale(1).setOrigin(0.5, 0.5);
    this.bag.setImmovable(true);
    // Jar item not yet used but can be added to inventory for scrapbook
    this.jar = this.physics.add.image(320, 280, 'jar').setScale(1).setOrigin(0.5, 0.5);
    this.jar.setImmovable(true);
    // Enable overlap detection
    this.players.forEach((player, idx) => {
      this.physics.add.overlap(player, this.stick, () => this.collectItem(idx, 'stick', this.stick));
      this.physics.add.overlap(player, this.bag, () => this.collectItem(idx, 'bag', this.bag));
      this.physics.add.overlap(player, this.jar, () => this.collectItem(idx, 'jar', this.jar));
    });
  }

  spawnSalve() {
    this.salve = this.physics.add.image(320, 200, 'salve');
    this.salve.setImmovable(true);
    this.players.forEach((player, idx) => {
      this.physics.add.overlap(player, this.salve, () => {
        if (this.health[idx] < 3) {
          this.health[idx] = Math.min(3, this.health[idx] + 1);
          this.updateUI();
          this.salve.destroy();
        }
      });
    });
  }

  spawnBugs() {
    this.bugs = [];
    const bugKeys = ['bug_a', 'bug_b', 'bug_c'];
    const positions = [ { x: 160, y: 100 }, { x: 320, y: 140 }, { x: 500, y: 110 } ];
    bugKeys.forEach((key, i) => {
      const bug = this.physics.add.sprite(positions[i].x, positions[i].y, key);
      bug.setCollideWorldBounds(true);
      // give random velocity
      bug.body.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-20, 20));
      bug.body.setBounce(1, 1);
      this.bugs.push(bug);
      // overlap detection with players
      this.players.forEach((player, idx) => {
        this.physics.add.overlap(player, bug, () => this.onPlayerBugCollision(idx, bug));
      });
    });
  }

  collectItem(playerIndex, itemName, itemSprite) {
    if (!itemSprite.active) return;
    this.inventories[playerIndex][itemName] = true;
    itemSprite.disableBody(true, true);
    this.updateUI();
  }

  craftNet(playerIndex) {
    const inv = this.inventories[playerIndex];
    if (!inv.net && inv.stick && inv.bag) {
      // consume stick and bag
      inv.stick = false;
      inv.bag = false;
      inv.net = true;
      this.updateUI();
    }
  }

  onPlayerBugCollision(playerIndex, bug) {
    if (!bug.active) return;
    const inv = this.inventories[playerIndex];
    if (inv.net) {
      // catch bug
      bug.disableBody(true, true);
      this.bugsCaught++;
      // If all bugs caught, show win screen
      if (this.bugsCaught >= this.totalBugs) {
        this.showWinScreen();
      }
    } else {
      // take damage
      if (this.health[playerIndex] > 0) {
        this.health[playerIndex]--;
        this.updateUI();
        // brief flicker to indicate hit
        const player = this.players[playerIndex];
        this.tweens.add({
          targets: player,
          alpha: 0.2,
          duration: 100,
          yoyo: true,
          repeat: 3,
        });
      }
    }
  }

  setupUI() {
    // Initially update hearts and inventory icons
    this.updateUI();
  }

  updateUI() {
    // Update hearts display
    const healthDiv = document.getElementById('health');
    const invDiv = document.getElementById('inventory');
    if (!healthDiv || !invDiv) return;
    // Clear contents
    healthDiv.innerHTML = '';
    invDiv.innerHTML = '';
    // For each player display hearts; separate players with margin
    this.health.forEach((hp, idx) => {
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.marginRight = '8px';
      for (let i = 0; i < 3; i++) {
        const img = document.createElement('img');
        img.src = 'assets/images/heart.png';
        img.style.opacity = i < hp ? '1' : '0.3';
        container.appendChild(img);
      }
      healthDiv.appendChild(container);
    });
    // Inventory: show collected items for first player only (for simplicity)
    const inv = this.inventories[0];
    ['stick', 'bag', 'jar', 'net'].forEach((item) => {
      if (inv[item]) {
        const img = document.createElement('img');
        img.src = `assets/images/${item}.png`;
        invDiv.appendChild(img);
      }
    });
  }

  showWinScreen() {
    // Create overlay
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.left = '0';
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.background = 'rgba(0,0,0,0.8)';
    div.style.color = '#fff';
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    div.style.fontSize = '24px';
    div.innerHTML = '<h2>Level Complete!</h2><p>You caught all the bugs!</p><p>Bug Scrapbook:</p>';
    // Add images of caught bugs
    ['bug_a', 'bug_b', 'bug_c'].forEach((key) => {
      const img = document.createElement('img');
      img.src = `assets/images/${key}.png`;
      img.style.width = '32px';
      img.style.height = '32px';
      img.style.margin = '4px';
      div.appendChild(img);
    });
    // Append overlay
    document.body.appendChild(div);
  }

  setupInput() {
    // Keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      c: Phaser.Input.Keyboard.KeyCodes.C,
    });
    // Additional key for player2 crafting (V)
    this.keys.v = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V);
  }

  setupTouchControls() {
    const touchControls = document.getElementById('touch-controls');
    if (!touchControls) return;
    const directions = {};
    const updateTouchDir = (dir, active) => {
      directions[dir] = active;
    };
    touchControls.querySelectorAll('.btn').forEach((btn) => {
      const dir = btn.dataset.dir;
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        updateTouchDir(dir, true);
      });
      btn.addEventListener('pointerup', (e) => {
        e.preventDefault();
        updateTouchDir(dir, false);
      });
      btn.addEventListener('pointerout', (e) => {
        e.preventDefault();
        updateTouchDir(dir, false);
      });
    });
    this.touchDirections = directions;
  }

  update(time, delta) {
    // Player 1 movement (arrows + touch)
    const speed = 100;
    // Determine movement for each player
    // Player 1: arrow keys or touch
    const p1 = this.players[0];
    let p1vx = 0;
    let p1vy = 0;
    if (this.cursors.left.isDown || this.touchDirections.left) p1vx = -speed;
    else if (this.cursors.right.isDown || this.touchDirections.right) p1vx = speed;
    if (this.cursors.up.isDown || this.touchDirections.up) p1vy = -speed;
    else if (this.cursors.down.isDown || this.touchDirections.down) p1vy = speed;
    p1.setVelocity(p1vx, p1vy);
    // Animate
    if (p1vx !== 0 || p1vy !== 0) p1.play('p1_walk_anim', true);
    else p1.play('p1_idle_anim', true);
    // Player 2: WASD
    const p2 = this.players[1];
    let p2vx = 0;
    let p2vy = 0;
    if (this.keys.a.isDown) p2vx = -speed;
    else if (this.keys.d.isDown) p2vx = speed;
    if (this.keys.w.isDown) p2vy = -speed;
    else if (this.keys.s.isDown) p2vy = speed;
    p2.setVelocity(p2vx, p2vy);
    if (p2vx !== 0 || p2vy !== 0) p2.play('p2_walk_anim', true);
    else p2.play('p2_idle_anim', true);
    // Crafting checks: Player1 uses C, Player2 uses V
    if (Phaser.Input.Keyboard.JustDown(this.keys.c)) {
      this.craftNet(0);
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.v)) {
      this.craftNet(1);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 360,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: MainScene,
};

window.addEventListener('load', () => {
  const game = new Phaser.Game(config);
});