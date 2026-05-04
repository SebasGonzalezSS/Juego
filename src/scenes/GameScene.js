import { TILE } from '../main.js';
import Player from '../entities/Player.js';
import Enemy  from '../entities/Enemy.js';
import { buildLevel, nextLevel, getLevel } from '../utils/LevelBuilder.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  init(data) {
    this._config    = data;
    this._levelId   = data.level  || '1-1';
    this._numP      = data.numPlayers || 1;
    this._charIds   = data.chars  || ['percy', 'harry'];
    this._lives     = [...(data.lives  || [3,3])];
    this._scores    = [...(data.scores || [0,0])];
    this._frozen    = false;
    this._frozenTimer = 0;
    this._levelOver = false;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const lvlData = getLevel(this._levelId);

    // ── Background ──────────────────────────────────────
    this._bgImg = this.add.tileSprite(0, 0, lvlData.width, H, 'bg_sky')
      .setOrigin(0).setScrollFactor(0).setDepth(-2);

    if (lvlData.hills) {
      this._hillsImg = this.add.tileSprite(0, H - 160, lvlData.width, 200, 'bg_hills')
        .setOrigin(0).setScrollFactor(0.3).setDepth(-1).setAlpha(0.9).setScale(0.55);
    }

    // ── Build level ─────────────────────────────────────
    const level = buildLevel(this, this._levelId);
    this._level  = level;
    this._platforms = level.platforms;
    this._coins     = level.coins;
    this._hazards   = level.hazards;
    this._goalZone  = level.goalZone;

    // ── World bounds ─────────────────────────────────────
    this.physics.world.setBounds(0, 0, level.worldWidth, level.worldHeight);

    // ── Enemies ──────────────────────────────────────────
    this._enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: false });
    this._spawnEnemies(level.enemyData);

    // ── Bullets pool ─────────────────────────────────────
    this._bullets = this.physics.add.group({
      defaultKey: 'bullet_fire', maxSize: 20, runChildUpdate: false,
    });

    // ── Mobile input object (must exist before _spawnPlayers) ────────
    this._mobileInput = { left:false, right:false, up:false, jumpJustPressed:false, shootJustPressed:false };

    // ── Players ──────────────────────────────────────────
    this._players = [];
    this._spawnPositions = [level.spawn1Px, level.spawn2Px];
    this._spawnPlayers();

    // ── Camera ────────────────────────────────────────────
    this.cameras.main.setBounds(0, 0, level.worldWidth, level.worldHeight);
    if (this._players[0]) {
      this.cameras.main.startFollow(this._players[0], true, 0.12, 0.1);
    }

    // ── Collisions ───────────────────────────────────────
    this._setupCollisions();

    // ── Mobile controls ─────────────────────────────────
    this._setupMobile();

    // ── Timer ────────────────────────────────────────────
    this._timeLeft = lvlData.timeLimit;
    this._ticker   = this.time.addEvent({ delay: 1000, loop: true, callback: this._tick, callbackScope: this });

    // ── Pause key ────────────────────────────────────────
    this._pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this._escKey   = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this._paused   = false;

    // ── Events ─────────────────────────────────────────
    this.events.on('player-died',  this._onPlayerDied,  this);
    this.events.on('time-freeze',  this._onTimeFreeze,  this);
    this.events.on('annabeth-reveal', this._onReveal,   this);

    // ── UI ─────────────────────────────────────────────
    this.scene.launch('UI', { gameScene: this });
    this._uiScene = this.scene.get('UI');

    this.cameras.main.fadeIn(500);
    this._pushRegistry();
  }

  /* ─── Spawn ───────────────────────────────────────────── */

  _spawnPlayers() {
    const KEY_P1 = this.input.keyboard.addKeys({
      left:    Phaser.Input.Keyboard.KeyCodes.LEFT,
      right:   Phaser.Input.Keyboard.KeyCodes.RIGHT,
      up:      Phaser.Input.Keyboard.KeyCodes.UP,
      shoot:   Phaser.Input.Keyboard.KeyCodes.M,
      special: Phaser.Input.Keyboard.KeyCodes.N,
    });
    const KEY_P2 = this.input.keyboard.addKeys({
      left:    Phaser.Input.Keyboard.KeyCodes.A,
      right:   Phaser.Input.Keyboard.KeyCodes.D,
      up:      Phaser.Input.Keyboard.KeyCodes.W,
      shoot:   Phaser.Input.Keyboard.KeyCodes.G,
      special: Phaser.Input.Keyboard.KeyCodes.H,
    });

    const keySets = [KEY_P1, KEY_P2];

    for (let i = 0; i < this._numP; i++) {
      const charId = this._charIds[i] || 'percy';
      const [px, py] = this._spawnPositions[i];
      const p = new Player(this, px, py, charId, keySets[i], i);
      p.lives  = this._lives[i];
      p.score  = this._scores[i];
      p.bullets = this._bullets;
      this._players.push(p);
    }

    if (this._players[0]) {
      this._players[0].mobileInput = this._mobileInput;
    }
  }

  _spawnEnemies(enemyData) {
    enemyData.forEach(([col, row, type, pl, pr, yOffset]) => {
      const x    = col * TILE + TILE/2;
      const y    = row * TILE + TILE/2 + (type==='flyer' ? -(yOffset||0) - TILE : -TILE/2);
      const baseY = y;
      const e    = new Enemy(this, x, y, type, pl, pr, baseY);
      this._enemies.add(e);
    });
  }

  /* ─── Collisions ─────────────────────────────────────── */

  _setupCollisions() {
    // Players vs platforms
    this._players.forEach(p => {
      this.physics.add.collider(p, this._platforms);
    });

    // Enemies vs platforms
    this.physics.add.collider(this._enemies, this._platforms);

    // Players collect coins
    this._players.forEach(p => {
      this.physics.add.overlap(p, this._coins, (player, coin) => {
        coin.destroy();
        player.collectCoin();
        this._pushRegistry();
      });
    });

    // Players touch hazards
    this._players.forEach(p => {
      this.physics.add.overlap(p, this._hazards, (player) => player.hurt());
    });

    // Players vs enemies
    this._players.forEach(p => {
      this.physics.add.overlap(p, this._enemies, (player, enemy) => {
        if (!enemy.alive) return;
        // Stomp detection: player falling onto enemy top
        const stomping = player.body.velocity.y > 60 &&
                         player.y < enemy.y - enemy.height * 0.1;
        if (stomping) {
          enemy.stomp(player.body.velocity.y);
          player.body.setVelocityY(-350);
          player.score += 100;
          this._pushRegistry();
        } else {
          player.hurt();
        }
      });
    });

    // Bullets vs enemies
    this.physics.add.overlap(this._bullets, this._enemies, (bullet, enemy) => {
      if (!enemy.alive) return;
      const owner = this._players[bullet._owner];
      if (owner) { owner.score += 150; this._pushRegistry(); }
      bullet.setActive(false).setVisible(false);
      enemy.takeDamage();
    });

    // Bullets vs platforms
    this.physics.add.collider(this._bullets, this._platforms, (bullet) => {
      bullet.setActive(false).setVisible(false);
    });

    // Goal zone
    this._players.forEach(p => {
      this.physics.add.overlap(p, this._goalZone, () => this._checkGoal());
    });

    // Kill plane — fallen off world
    this._players.forEach(p => {
      p.setDataEnabled();
    });
  }

  /* ─── Mobile controls ────────────────────────────────── */

  _setupMobile() {
    this._mobileInput = { left: false, right: false, up: false,
                          jumpJustPressed: false, shootJustPressed: false };
    const attach = (id, state) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('touchstart', e => { e.preventDefault(); this._mobileInput[state] = true;  }, { passive: false });
      el.addEventListener('touchend',   e => { e.preventDefault(); this._mobileInput[state] = false; }, { passive: false });
    };
    attach('btn-left',  'left');
    attach('btn-right', 'right');
    attach('btn-up',    'jumpJustPressed');
    attach('btn-shoot', 'shootJustPressed');
  }

  /* ─── Registry sync (UIScene reads these) ─────────────── */

  _pushRegistry() {
    this.registry.set('lives',  [...this._lives]);
    this.registry.set('scores', this._players.map(p => p?.score || 0));
    this.registry.set('coins',  this._players.map(p => p?.coins || 0));
    this.registry.set('time',   Math.ceil(this._timeLeft));
    this.registry.set('levelId', this._levelId);
    this.registry.set('goalCoins', getLevel(this._levelId).goalCoins);
    this.registry.set('numPlayers', this._numP);
    this.registry.set('charIds', this._charIds);
  }

  /* ─── Pause ───────────────────────────────────────────── */

  _togglePause() {
    this._paused = !this._paused;
    if (this._paused) {
      this.physics.world.pause();
      this._showPauseOverlay();
    } else {
      this.physics.world.resume();
      this._pauseOverlay?.destroy();
      this._pauseOverlay = null;
    }
  }

  _showPauseOverlay() {
    const { width: W, height: H } = this.scale;
    this._pauseOverlay = this.add.container(0, 0).setDepth(100).setScrollFactor(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.6); bg.fillRect(0,0,W,H);
    const txt = this.add.text(W/2, H/2 - 30, 'PAUSA', {
      fontFamily:'Cinzel, serif', fontSize:'52px', color:'#f0c060',
    }).setOrigin(0.5);
    const sub = this.add.text(W/2, H/2 + 30, 'Presiona P para continuar', {
      fontFamily:'Cinzel, serif', fontSize:'20px', color:'#cccccc',
    }).setOrigin(0.5);
    this._pauseOverlay.add([bg, txt, sub]);
  }

  /* ─── Timer ──────────────────────────────────────────── */

  _tick() {
    if (this._paused || this._frozen || this._levelOver) return;
    this._timeLeft--;
    this._pushRegistry();
    if (this._timeLeft <= 0) this._gameOver('time');
  }

  /* ─── Level end ─────────────────────────────────────── */

  _checkGoal() {
    if (this._levelOver) return;
    const lvlData = getLevel(this._levelId);
    const totalCoins = this._players.reduce((s, p) => s + (p?.coins || 0), 0);
    if (totalCoins < lvlData.goalCoins) return;
    this._winLevel();
  }

  _winLevel() {
    if (this._levelOver) return;
    this._levelOver = true;
    this._ticker.remove();

    this.cameras.main.flash(500, 255, 255, 100);
    this._showBanner('¡NIVEL COMPLETADO!', '#FFD700');

    const next = nextLevel(this._levelId);
    this.time.delayedCall(2500, () => {
      this.scene.stop('UI');
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        if (next) {
          this.scene.restart({
            ...this._config,
            level: next,
            lives:  this._players.map(p => p?.lives || 1),
            scores: this._players.map(p => p?.score || 0),
          });
        } else {
          this._showVictory();
        }
      });
    });
  }

  _gameOver(reason) {
    if (this._levelOver) return;
    this._levelOver = true;
    this._ticker?.remove();

    this._showBanner(reason === 'time' ? '¡TIEMPO!' : '¡GAME OVER!', '#FF4444');
    this.cameras.main.shake(300, 0.01);

    this.time.delayedCall(2800, () => {
      this.scene.stop('UI');
      this.cameras.main.fadeOut(400, 0,0,0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('Menu');
      });
    });
  }

  _showVictory() {
    this.scene.stop('UI');
    const { width: W, height: H } = this.scale;
    const g = this.add.graphics().setScrollFactor(0).setDepth(99);
    g.fillStyle(0x0a0a18, 0.92); g.fillRect(0,0,W,H);
    this.add.text(W/2, H/2 - 60, '¡VICTORIA!', {
      fontFamily:'Cinzel, serif', fontSize:'64px', color:'#FFD700',
      stroke:'#3a1800', strokeThickness: 6, scrollFactor: 0,
    }).setOrigin(0.5).setDepth(100);
    this.add.text(W/2, H/2 + 10, '¡Has completado todos los niveles!', {
      fontFamily:'Cinzel, serif', fontSize:'22px', color:'#fff', scrollFactor:0,
    }).setOrigin(0.5).setDepth(100);
    const totalScore = this._players.reduce((s,p) => s+(p?.score||0), 0);
    this.add.text(W/2, H/2 + 50, `Puntaje: ${totalScore}`, {
      fontFamily:'Cinzel, serif', fontSize:'26px', color:'#f0c060', scrollFactor:0,
    }).setOrigin(0.5).setDepth(100);
    this.add.text(W/2, H/2 + 100, 'Presiona ESC para volver al menú', {
      fontFamily:'Crimson Text, serif', fontSize:'18px', color:'#aaaaaa', scrollFactor:0,
    }).setOrigin(0.5).setDepth(100);
  }

  _showBanner(msg, color) {
    const { width: W, height: H } = this.scale;
    const txt = this.add.text(W/2, H/3, msg, {
      fontFamily:'Cinzel, serif', fontSize:'46px', color,
      stroke:'#000', strokeThickness:5, scrollFactor:0,
    }).setOrigin(0.5).setDepth(50).setAlpha(0);
    this.tweens.add({ targets: txt, alpha: 1, y: H/3 - 20, duration: 500, ease:'Back.easeOut' });
  }

  /* ─── Events ────────────────────────────────────────── */

  _onPlayerDied(playerIdx) {
    this._lives[playerIdx] = (this._players[playerIdx]?.lives || 0);
    this._pushRegistry();

    if (this._lives[playerIdx] <= 0) {
      // Check if all players are dead
      const allDead = this._players.every(p => !p?.active || p.lives <= 0);
      if (allDead) { this._gameOver('lives'); return; }
    } else {
      // Respawn after a delay
      this.time.delayedCall(1500, () => {
        const p = this._players[playerIdx];
        if (p) {
          const [rx, ry] = this._spawnPositions[playerIdx];
          p.lives = this._lives[playerIdx];
          p.respawn(rx, ry);
        }
      });
    }
  }

  _onTimeFreeze(duration) {
    this._frozen = true;
    this._enemies.getChildren().forEach(e => {
      if (e.alive) { e.setTint(0xADD8E6); e.body?.setVelocity(0,0); }
    });
    this.time.delayedCall(duration, () => {
      this._frozen = false;
      this._enemies.getChildren().forEach(e => {
        if (e.alive) e.clearTint();
      });
    });
  }

  _onReveal() {
    // Flash hidden/secret coins briefly
    this._coins.getChildren().forEach(c => {
      this.tweens.add({ targets: c, alpha: [1, 0.2, 1], duration: 600, repeat: 2 });
    });
  }

  /* ─── Update ─────────────────────────────────────────── */

  update(time, delta) {
    // Pause toggle
    if (Phaser.Input.Keyboard.JustDown(this._pauseKey)) this._togglePause();
    if (Phaser.Input.Keyboard.JustDown(this._escKey)) {
      this.scene.stop('UI');
      this.scene.start('Menu');
    }

    if (this._paused || this._levelOver) return;

    // Kill plane
    this._players.forEach(p => {
      if (p.active && p.y > this.physics.world.bounds.height + 64) p.hurt();
    });

    // Cull dead bullets
    this._bullets.getChildren().forEach(b => {
      if (!b.active) return;
      b._life -= delta;
      if (b._life <= 0 || b.x < 0 || b.x > this.physics.world.bounds.width) {
        b.setActive(false).setVisible(false);
      }
    });

    // Freeze enemies if time-frozen
    if (this._frozen) {
      this._enemies.getChildren().forEach(e => {
        if (e.alive && e._type !== 'flyer') e.body.setVelocityX(0);
      });
    }

    // In 2-player mode, follow the player who is furthest right (leads the team)
    if (this._numP > 1) {
      const leader = this._players
        .filter(p => p?.active)
        .sort((a, b) => b.x - a.x)[0];
      if (leader) this.cameras.main.startFollow(leader, true, 0.12, 0.1);
    }

    // Coin requirement hint
    if (!this._hintShown) {
      const lvlData = getLevel(this._levelId);
      const totalCoins = this._players.reduce((s, p) => s + (p?.coins || 0), 0);
      if (totalCoins >= lvlData.goalCoins) {
        this._hintShown = true;
        this._showBanner('¡Meta alcanzada! ¡Llega a la bandera!', '#A5D6A7');
      }
    }
  }
}
