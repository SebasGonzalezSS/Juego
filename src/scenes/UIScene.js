import { CHARS } from './BootScene.js';

export default class UIScene extends Phaser.Scene {
  constructor() { super({ key: 'UI', active: false }); }

  init(data) {
    this._gameScene = data.gameScene;
  }

  create() {
    const { width: W } = this.scale;

    // P1 HUD — left
    this._p1Hud = this._makeHud(12, 10, 0);

    // P2 HUD — right (only shown in 2-player)
    this._p2Hud = this._makeHud(W - 12, 10, 1, true);

    // Centre — timer
    this._timerBg = this.add.graphics();
    this._timerBg.fillStyle(0x000000, 0.55); this._timerBg.fillRoundedRect(W/2 - 48, 10, 96, 38, 8);
    this._timerBg.lineStyle(1, 0xffffff, 0.2); this._timerBg.strokeRoundedRect(W/2 - 48, 10, 96, 38, 8);

    this._timerTxt = this.add.text(W/2, 29, '200', {
      fontFamily: 'Cinzel, serif', fontSize: '26px', color: '#ffffff',
    }).setOrigin(0.5);

    // Level label
    this._levelTxt = this.add.text(W/2, 54, '', {
      fontFamily: 'Cinzel, serif', fontSize: '12px', color: '#aaaaaa',
    }).setOrigin(0.5);

    // Coin goal indicator
    this._goalTxt = this.add.text(W/2, 70, '', {
      fontFamily: 'Crimson Text, serif', fontSize: '13px', color: '#FFD700',
    }).setOrigin(0.5);

    this.registry.events.on('changedata', this._onRegistryChange, this);
    this._onRegistryChange();
  }

  _makeHud(x, y, playerIdx, rightAlign = false) {
    const dir = rightAlign ? -1 : 1;
    const ox  = rightAlign ? -156 : 0;

    const bg  = this.add.graphics();
    bg.fillStyle(0x000000, 0.55); bg.fillRoundedRect(x + ox, y, 156, 74, 8);
    bg.lineStyle(1, 0xffffff, 0.15); bg.strokeRoundedRect(x + ox, y, 156, 74, 8);

    const ix  = x + ox + 8;
    const charColor = playerIdx === 0 ? '#64B5F6' : '#FF8A65';

    // Character name
    const nameTxt = this.add.text(ix + 18, y + 8, '', {
      fontFamily: 'Cinzel, serif', fontSize: '13px', color: charColor,
    });

    // Lives
    const heartIcon = this.add.image(ix + 6, y + 32, 'heart').setScale(1.1);
    const livesTxt  = this.add.text(ix + 18, y + 26, '3', {
      fontFamily: 'Cinzel, serif', fontSize: '18px', color: '#F44336',
    });

    // Coins
    const coinIcon = this.add.image(ix + 6, y + 54, 'coin_icon').setScale(1.1);
    const coinsTxt = this.add.text(ix + 18, y + 48, '0', {
      fontFamily: 'Crimson Text, serif', fontSize: '16px', color: '#FFD700',
    });

    // Score
    const scoreTxt = this.add.text(ix + 90, y + 26, '0', {
      fontFamily: 'Cinzel, serif', fontSize: '14px', color: '#ffffff',
    }).setOrigin(1, 0);

    return { bg, nameTxt, heartIcon, livesTxt, coinIcon, coinsTxt, scoreTxt };
  }

  _onRegistryChange() {
    const lives     = this.registry.get('lives')      || [3, 3];
    const scores    = this.registry.get('scores')     || [0, 0];
    const coins     = this.registry.get('coins')      || [0, 0];
    const time      = this.registry.get('time')       ?? 200;
    const levelId   = this.registry.get('levelId')    || '1-1';
    const goalCoins = this.registry.get('goalCoins')  || 15;
    const numP      = this.registry.get('numPlayers') || 1;
    const charIds   = this.registry.get('charIds')    || ['percy', 'harry'];

    // P1
    const c1 = CHARS[charIds[0]];
    if (c1) this._p1Hud.nameTxt.setText(c1.name.split(' ')[0]);
    this._p1Hud.livesTxt.setText(`× ${lives[0] ?? 3}`);
    this._p1Hud.coinsTxt.setText(`× ${coins[0] ?? 0}`);
    this._p1Hud.scoreTxt.setText(String(scores[0] ?? 0).padStart(6, '0'));
    this._p1Hud.livesTxt.setColor(lives[0] <= 1 ? '#FF1744' : '#F44336');

    // P2 — show/hide
    const showP2 = numP > 1;
    [this._p2Hud.bg, this._p2Hud.nameTxt, this._p2Hud.heartIcon,
     this._p2Hud.livesTxt, this._p2Hud.coinIcon, this._p2Hud.coinsTxt,
     this._p2Hud.scoreTxt].forEach(o => o.setVisible(showP2));

    if (showP2) {
      const c2 = CHARS[charIds[1]];
      if (c2) this._p2Hud.nameTxt.setText(c2.name.split(' ')[0]);
      this._p2Hud.livesTxt.setText(`× ${lives[1] ?? 3}`);
      this._p2Hud.coinsTxt.setText(`× ${coins[1] ?? 0}`);
      this._p2Hud.scoreTxt.setText(String(scores[1] ?? 0).padStart(6, '0'));
      this._p2Hud.livesTxt.setColor(lives[1] <= 1 ? '#FF1744' : '#F44336');
    }

    // Timer
    const secs = Math.ceil(time);
    this._timerTxt.setText(String(secs).padStart(3, '0'));
    this._timerTxt.setColor(secs <= 30 ? '#FF4444' : '#ffffff');
    if (secs <= 30) {
      this._timerBg.clear();
      this._timerBg.fillStyle(0x440000, 0.75);
      this._timerBg.fillRoundedRect(this.scale.width/2 - 48, 10, 96, 38, 8);
      this._timerBg.lineStyle(1, 0xff4444, 0.5);
      this._timerBg.strokeRoundedRect(this.scale.width/2 - 48, 10, 96, 38, 8);
    }

    // Level label & goal
    this._levelTxt.setText(`Nivel ${levelId}`);
    const totalCoins = (coins[0]||0) + (coins[1]||0);
    const met = totalCoins >= goalCoins;
    this._goalTxt.setText(`Monedas: ${totalCoins} / ${goalCoins}`);
    this._goalTxt.setColor(met ? '#66BB6A' : '#FFD700');
  }

  update() {
    // Pulse timer when low
    const time = this.registry.get('time') ?? 200;
    if (time <= 10) {
      this._timerTxt.setScale(1 + 0.06 * Math.sin(this.time.now / 200));
    }
  }
}
