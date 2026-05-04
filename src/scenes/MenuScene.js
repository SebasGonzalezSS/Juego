export default class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    const { width: W, height: H } = this.scale;
    this._transitioning = false;

    // ── Background ─────────────────────────────────────────
    this.add.image(W/2, H/2, 'bg_sky').setDisplaySize(W, H);

    // Static hills image (avoid TileSprite NPOT-texture issues)
    this.add.image(W/2, H - 60, 'bg_hills')
      .setDisplaySize(W + 40, 180).setAlpha(0.85);

    // Overlay darkening
    const ov = this.add.graphics();
    ov.fillStyle(0x000000, 0.25);
    ov.fillRect(0, 0, W, H);

    // ── Title ──────────────────────────────────────────────
    const title = this.add.text(W/2, 108, 'Chronicles\nof the Chosen', {
      fontFamily: 'Cinzel, serif',
      fontSize: '54px',
      fontStyle: 'bold',
      color: '#f0c060',
      stroke: '#3a1800',
      strokeThickness: 6,
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(W/2, 196, 'Crónicas de los Elegidos', {
      fontFamily: 'Cinzel, serif',
      fontSize: '17px',
      color: '#c8982a',
      letterSpacing: 5,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title, y: 115,
      duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // ── Buttons ────────────────────────────────────────────
    // Using Text.setInteractive() — most reliable approach in Phaser 3
    this._makeBtn(W/2, 282, '▶  1 Jugador',     () => this._go('1p'));
    this._makeBtn(W/2, 348, '▶  2 Jugadores',   () => this._go('2p'));
    this._makeBtn(W/2, 414, '○  Online (Próx.)', null);

    // ── Controls hint ──────────────────────────────────────
    this.add.text(W/2, H - 22, 'Flechas / WASD  ·  Saltar ↑/W  ·  Disparar M/G', {
      fontFamily: 'Crimson Text, serif', fontSize: '14px', color: '#999999',
    }).setOrigin(0.5);

    // ── Keyboard shortcuts ─────────────────────────────────
    this.input.keyboard.on('keydown-ONE',   () => this._go('1p'));
    this.input.keyboard.on('keydown-TWO',   () => this._go('2p'));
    this.input.keyboard.on('keydown-ENTER', () => this._go('1p'));

    // ── Floating particles ─────────────────────────────────
    this._spawnParticles();

    this.cameras.main.fadeIn(500);
  }

  _makeBtn(x, y, label, cb) {
    const on  = cb !== null;
    const btn = this.add.text(x, y, label, {
      fontFamily:      'Cinzel, serif',
      fontSize:        '22px',
      color:           on ? '#f0c060' : '#555555',
      stroke:          on ? '#3a1800' : 'transparent',
      strokeThickness: on ? 3 : 0,
      backgroundColor: on ? '#6b4f10bb' : '#1a1a1a99',
      padding:         { x: 30, y: 13 },
    }).setOrigin(0.5);

    if (!on) return btn;

    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerover',  () => btn.setStyle({ backgroundColor: '#a07820cc' }));
    btn.on('pointerout',   () => btn.setStyle({ backgroundColor: '#6b4f10bb' }));
    btn.on('pointerdown',  () => { btn.setStyle({ backgroundColor: '#d4a040ee' }); cb(); });

    return btn;
  }

  _go(mode) {
    if (this._transitioning) return;
    this._transitioning = true;
    // Direct scene.start — no camera-event chain that can silently fail
    this.scene.start('CharSelect', { mode, numPlayers: mode === '2p' ? 2 : 1 });
  }

  _spawnParticles() {
    const { width: W, height: H } = this.scale;
    for (let i = 0; i < 16; i++) {
      const px = Phaser.Math.Between(20, W - 20);
      const py = Phaser.Math.Between(20, H - 20);
      const p  = this.add.image(px, py, 'particle')
        .setAlpha(0).setScale(0.4 + Math.random() * 0.6);
      this.tweens.add({
        targets: p,
        alpha:   { from: 0, to: 0.6 },
        y:       py - Phaser.Math.Between(40, 110),
        duration: 1600 + Math.random() * 1800,
        delay:    Math.random() * 2500,
        yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }
}
