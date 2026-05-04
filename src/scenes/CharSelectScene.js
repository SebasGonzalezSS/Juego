import { CHARS } from './BootScene.js';

const CHAR_KEYS = Object.keys(CHARS);

export default class CharSelectScene extends Phaser.Scene {
  constructor() { super('CharSelect'); }

  init(data) {
    this._mode    = data.mode || '1p';
    this._nPlayers = data.numPlayers || 1;
    this._sel     = [0, 1]; // current selection index per player
    this._locked  = [false, false];
    this._cursors  = null;
    this._wasd     = null;
  }

  create() {
    const { width: W, height: H } = this.scale;

    // Background
    this.add.image(W/2, H/2, 'bg_sky').setDisplaySize(W, H).setAlpha(0.5);
    const overlay = this.add.graphics();
    overlay.fillStyle(0x0a0a18, 0.65); overlay.fillRect(0,0,W,H);

    // Title
    this.add.text(W/2, 32, 'Elige tu Personaje', {
      fontFamily: 'Cinzel, serif', fontSize: '34px', color: '#f0c060',
      stroke: '#3a1800', strokeThickness: 4,
    }).setOrigin(0.5);

    // Player labels
    const p1Label = this.add.text(W/4, 68, '⚔ Jugador 1', {
      fontFamily: 'Cinzel, serif', fontSize: '18px', color: '#64B5F6',
    }).setOrigin(0.5);
    if (this._nPlayers > 1) {
      this.add.text(3*W/4, 68, '⚔ Jugador 2', {
        fontFamily: 'Cinzel, serif', fontSize: '18px', color: '#FF8A65',
      }).setOrigin(0.5);
    }

    // Character grid: 3 columns, 2 rows, centred
    const COLS = 3, ROWS = 2;
    const PAD  = 16;
    const SIZE = 80;
    const gridW = COLS * (SIZE + PAD) - PAD;
    const gridH = ROWS * (SIZE + PAD) - PAD;
    const gx = W/2 - gridW/2;
    const gy = 110;

    this._cards = CHAR_KEYS.map((id, i) => {
      const col = i % COLS, row = Math.floor(i / COLS);
      const cx = gx + col * (SIZE+PAD) + SIZE/2;
      const cy = gy + row * (SIZE+PAD) + SIZE/2;
      return this._makeCard(cx, cy, CHARS[id], i);
    });

    // Info panels — centre P1 panel when 1-player
    const p1InfoX = this._nPlayers > 1 ? W/4 : W/2;
    this._info = [
      this._makeInfoPanel(p1InfoX, 340, '#64B5F6'),
      this._makeInfoPanel(3*W/4,   340, '#FF8A65'),
    ];
    if (this._nPlayers === 1) this._info[1].panel.setVisible(false);

    // Selection cursors (one per active player)
    this._cursGfx = [
      this.add.graphics(),
      this.add.graphics(),
    ];
    this._updateUI();

    // Confirm button (appears when all active players locked)
    this._confirmBtn = this._makeConfirmBtn(W/2, H - 48);
    this._confirmBtn.setAlpha(0);

    // Controls hint
    this.add.text(W/2, H - 14, 'Flechas: P1  |  WASD: P2  |  Enter/Espacio: Confirmar', {
      fontFamily: 'Crimson Text, serif', fontSize: '13px', color: '#888888',
    }).setOrigin(0.5);

    // Keyboard
    this._cursors = this.input.keyboard.createCursorKeys();
    this._wasd    = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      confirm: Phaser.Input.Keyboard.KeyCodes.G,
    });
    this._enter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this._space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.cameras.main.fadeIn(300);
  }

  _makeCard(cx, cy, char, idx) {
    const SIZE = 80;
    const bg = this.add.graphics();

    const portrait = this.add.image(cx, cy - 6, `portrait_${char.id}`).setDisplaySize(52, 52);
    const nameTxt  = this.add.text(cx, cy + 31, char.name.split(' ')[0], {
      fontFamily: 'Cinzel, serif', fontSize: '11px', color: '#ffffff',
    }).setOrigin(0.5);

    const zone = this.add.zone(cx, cy, SIZE, SIZE).setInteractive();
    zone.on('pointerdown', () => {
      this._movePlayer(0, idx);
      if (this._nPlayers > 1) this._movePlayer(1, idx, false);
    });
    zone.on('pointerover', () => {
      portrait.setScale(1.08); nameTxt.setColor('#f0c060');
    });
    zone.on('pointerout', () => {
      portrait.setScale(1); nameTxt.setColor('#ffffff');
    });

    return { cx, cy, bg, portrait, nameTxt, char };
  }

  _makeInfoPanel(x, y, accentColor) {
    const panel = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.5); bg.fillRoundedRect(-140, -55, 280, 110, 10);
    bg.lineStyle(2, parseInt(accentColor.replace('#','0x')), 0.7);
    bg.strokeRoundedRect(-140, -55, 280, 110, 10);
    const name    = this.add.text(0, -35, '', { fontFamily:'Cinzel, serif',    fontSize:'18px', color: accentColor }).setOrigin(0.5);
    const sub     = this.add.text(0, -12, '', { fontFamily:'Crimson Text, serif', fontSize:'14px', color:'#cccccc', fontStyle:'italic' }).setOrigin(0.5);
    const ability = this.add.text(0,  12, '', { fontFamily:'Crimson Text, serif', fontSize:'13px', color:'#aaddff' }).setOrigin(0.5);
    const hint    = this.add.text(0,  36, 'Presiona Enter para confirmar', { fontFamily:'Crimson Text, serif', fontSize:'12px', color:'#888888' }).setOrigin(0.5);
    panel.add([bg, name, sub, ability, hint]);
    return { panel, name, sub, ability, hint };
  }

  _makeConfirmBtn(x, y) {
    const g = this.add.graphics();
    g.fillStyle(0x1b5e20, 0.9); g.fillRoundedRect(x-110, y-20, 220, 40, 10);
    g.lineStyle(2, 0x66bb6a); g.strokeRoundedRect(x-110, y-20, 220, 40, 10);
    const t = this.add.text(x, y, '¡Comenzar Aventura!', {
      fontFamily:'Cinzel, serif', fontSize:'20px', color:'#A5D6A7',
    }).setOrigin(0.5);
    const zone = this.add.zone(x, y, 220, 40).setInteractive();
    zone.on('pointerdown', () => this._startGame());
    return this.add.container(0, 0, [g, t, zone]);
  }

  _movePlayer(playerIdx, targetIdx, wrap = true) {
    if (this._locked[playerIdx]) return;
    this._sel[playerIdx] = targetIdx;
    this._updateUI();
  }

  _navigatePlayer(playerIdx, dir) {
    if (this._locked[playerIdx]) return;
    let idx = this._sel[playerIdx] + dir;
    idx = Phaser.Math.Clamp(idx, 0, CHAR_KEYS.length - 1);
    this._sel[playerIdx] = idx;
    this._updateUI();
  }

  _lockPlayer(playerIdx) {
    if (this._locked[playerIdx]) {
      this._locked[playerIdx] = false;
    } else {
      this._locked[playerIdx] = true;
      const char = CHARS[CHAR_KEYS[this._sel[playerIdx]]];
      this.cameras.main.flash(200, 255, 215, 0, false);
    }
    this._updateUI();

    // Check if we can start
    const allLocked = this._locked.slice(0, this._nPlayers).every(Boolean);
    this._confirmBtn.setAlpha(allLocked ? 1 : 0);
    if (allLocked) {
      this.tweens.add({
        targets: this._confirmBtn, scaleX: [1, 1.05, 1], scaleY: [1, 1.05, 1],
        duration: 400, ease: 'Sine.easeOut',
      });
    }
  }

  _updateUI() {
    // Draw cursor boxes around selected characters
    this._cursGfx.forEach((g, pi) => {
      g.clear();
      if (pi >= this._nPlayers) return;
      const idx = this._sel[pi];
      const card = this._cards[idx];
      const color = pi === 0 ? 0x64B5F6 : 0xFF8A65;
      const size = this._locked[pi] ? 82 : 78;
      g.lineStyle(this._locked[pi] ? 3 : 2, color, 1);
      g.strokeRect(card.cx - size/2, card.cy - size/2, size, size);
    });

    // Update info panels
    for (let pi = 0; pi < this._nPlayers; pi++) {
      const char = CHARS[CHAR_KEYS[this._sel[pi]]];
      const inf  = this._info[pi];
      inf.name.setText(char.name);
      inf.sub.setText(char.sub);
      inf.ability.setText(char.ability);
      inf.hint.setText(this._locked[pi] ? '✓ Bloqueado!' : 'Enter/Espacio para confirmar');
      inf.hint.setColor(this._locked[pi] ? '#66BB6A' : '#888888');
    }
  }

  update() {
    // Player 1: arrow keys + Enter
    if (Phaser.Input.Keyboard.JustDown(this._cursors.left))  this._navigatePlayer(0, -1);
    if (Phaser.Input.Keyboard.JustDown(this._cursors.right)) this._navigatePlayer(0, +1);
    if (Phaser.Input.Keyboard.JustDown(this._cursors.up))    this._navigatePlayer(0, -3);
    if (Phaser.Input.Keyboard.JustDown(this._cursors.down))  this._navigatePlayer(0, +3);
    if (Phaser.Input.Keyboard.JustDown(this._enter)) this._lockPlayer(0);

    // Player 2: WASD + G
    if (this._nPlayers > 1) {
      if (Phaser.Input.Keyboard.JustDown(this._wasd.left))  this._navigatePlayer(1, -1);
      if (Phaser.Input.Keyboard.JustDown(this._wasd.right)) this._navigatePlayer(1, +1);
      if (Phaser.Input.Keyboard.JustDown(this._wasd.up))    this._navigatePlayer(1, -3);
      if (Phaser.Input.Keyboard.JustDown(this._wasd.down))  this._navigatePlayer(1, +3);
      if (Phaser.Input.Keyboard.JustDown(this._wasd.confirm)) this._lockPlayer(1);
    }

    if (Phaser.Input.Keyboard.JustDown(this._space)) {
      if (!this._locked[0]) this._lockPlayer(0);
      else if (this._nPlayers > 1 && !this._locked[1]) this._lockPlayer(1);
      else this._startGame();
    }

    // Auto-start when all locked
    const allLocked = this._locked.slice(0, this._nPlayers).every(Boolean);
    if (allLocked && Phaser.Input.Keyboard.JustDown(this._enter)) this._startGame();
  }

  _startGame() {
    const allLocked = this._locked.slice(0, this._nPlayers).every(Boolean);
    if (!allLocked) return;

    const chars = [
      CHAR_KEYS[this._sel[0]],
      this._nPlayers > 1 ? CHAR_KEYS[this._sel[1]] : null,
    ];

    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('Game', {
        mode: this._mode,
        numPlayers: this._nPlayers,
        chars,
        level: '1-1',
        lives: [3, 3],
        scores: [0, 0],
      });
    });
  }
}
