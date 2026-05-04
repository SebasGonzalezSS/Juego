export default class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    const { width: W, height: H } = this.scale;

    // Parallax background
    this._bg = this.add.image(W/2, H/2, 'bg_sky').setDisplaySize(W, H);
    this._hills = this.add.tileSprite(0, H-120, W*2, 200, 'bg_hills')
      .setOrigin(0, 0).setScale(0.6).setAlpha(0.9);

    // Title
    const title = this.add.text(W/2, 110, 'Chronicles\nof the Chosen', {
      fontFamily: 'Cinzel, serif',
      fontSize: '56px',
      fontStyle: 'bold',
      color: '#f0c060',
      stroke: '#3a1800',
      strokeThickness: 6,
      align: 'center',
      shadow: { offsetX: 0, offsetY: 4, color: '#000', blur: 8, fill: true },
    }).setOrigin(0.5);

    const sub = this.add.text(W/2, 195, 'Crónicas de los Elegidos', {
      fontFamily: 'Cinzel, serif',
      fontSize: '18px',
      color: '#d4a050',
      letterSpacing: 6,
    }).setOrigin(0.5);

    // Gentle float animation on title
    this.tweens.add({ targets: title, y: 116, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Buttons
    const buttons = [
      { label: '1 Jugador',    mode: '1p',     y: 280 },
      { label: '2 Jugadores',  mode: '2p',     y: 340 },
      { label: 'Online (Próx.)', mode: null,   y: 400 },
    ];

    buttons.forEach(({ label, mode, y }) => {
      const enabled = mode !== null;
      const btn = this._makeButton(W/2, y, label, enabled, () => {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('CharSelect', { mode, numPlayers: mode === '2p' ? 2 : 1 });
        });
      });
    });

    // Version / controls hint
    this.add.text(W/2, H - 24, 'Flechas/WASD • Saltar ↑/W • Disparar M/G', {
      fontFamily: 'Crimson Text, serif', fontSize: '14px', color: '#aaaaaa',
    }).setOrigin(0.5);

    // Floating particles
    this._spawnParticles();

    this.cameras.main.fadeIn(400);
  }

  update() {
    if (this._hills) this._hills.tilePositionX += 0.4;
  }

  _makeButton(x, y, label, enabled, cb) {
    const bg = this.add.graphics();
    const drawBtn = (hover) => {
      bg.clear();
      if (!enabled) {
        bg.fillStyle(0x333333, 0.6);
      } else if (hover) {
        bg.fillStyle(0xa07820, 0.95);
      } else {
        bg.fillStyle(0x6b4f10, 0.85);
      }
      bg.fillRoundedRect(x-120, y-22, 240, 44, 10);
      bg.lineStyle(2, enabled ? 0xf0c060 : 0x555555, 0.8);
      bg.strokeRoundedRect(x-120, y-22, 240, 44, 10);
    };
    drawBtn(false);

    const txt = this.add.text(x, y, label, {
      fontFamily: 'Cinzel, serif',
      fontSize: '22px',
      color: enabled ? '#f0c060' : '#666666',
    }).setOrigin(0.5);

    if (enabled) {
      // Zone is more reliable than Graphics.setInteractive for hit areas
      const zone = this.add.zone(x, y, 240, 44).setInteractive();
      zone.on('pointerover',  () => { drawBtn(true);  txt.setScale(1.05); });
      zone.on('pointerout',   () => { drawBtn(false); txt.setScale(1);    });
      zone.on('pointerdown',  () => { cb(); });
    }
    return { bg, txt };
  }

  _spawnParticles() {
    const { width: W, height: H } = this.scale;
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(0, H);
      const p = this.add.image(x, y, 'particle').setAlpha(0).setScale(0.5 + Math.random());
      this.tweens.add({
        targets: p,
        alpha: { from: 0, to: 0.7 },
        y: y - Phaser.Math.Between(40, 120),
        duration: 1500 + Math.random() * 2000,
        delay: Math.random() * 3000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }
}
