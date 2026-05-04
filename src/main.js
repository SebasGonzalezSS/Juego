import BootScene   from './scenes/BootScene.js';
import MenuScene   from './scenes/MenuScene.js';
import CharSelect  from './scenes/CharSelectScene.js';
import GameScene   from './scenes/GameScene.js';
import UIScene     from './scenes/UIScene.js';

export const GAME_W = 960;
export const GAME_H = 544;
export const TILE   = 32;

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME_W,
  height: GAME_H,
  parent: 'game-container',
  backgroundColor: '#0a0a18',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 900 }, debug: false },
  },
  scene: [BootScene, MenuScene, CharSelect, GameScene, UIScene],
});

window.addEventListener('game-progress', e => {
  const bar = document.getElementById('loading-bar');
  const tip = document.getElementById('loading-tip');
  if (bar) bar.style.width = (e.detail.progress * 100) + '%';
  if (tip && e.detail.tip) tip.textContent = e.detail.tip;
});

window.addEventListener('game-ready', () => {
  const s = document.getElementById('loading-screen');
  if (s) {
    s.classList.add('hidden');
    setTimeout(() => (s.style.display = 'none'), 900);
  }
});

export default game;
