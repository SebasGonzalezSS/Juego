import { TILE } from '../main.js';

/* ─── Level data ─────────────────────────────────────────────────────────── */
// Platforms: [col, row, widthCols, tileKey]
// Coins/Enemies/Spikes: [col, row, ...]
// Rows counted from 0 (top). Game is 17 rows tall (17 × 32 = 544px).
// Ground starts at row 14. Players stand on row 13.

const LEVELS = {
  '1-1': {
    id: '1-1', world: 1, stage: 1,
    name: 'Colinas de la Mañana',
    bg: 'bg_sky', hills: true,
    width: 2560,   // 80 tiles
    goalCoins: 15,
    timeLimit: 200,
    spawn1: [2, 13], spawn2: [3, 13],
    goal:   [77, 13],

    platforms: [
      // Ground — two sections with a 3-tile gap at col 15-17
      [0,  14, 15, 'tile_ground'],
      [18, 14, 62, 'tile_ground'],
      // Floating platforms
      [4,  11,  4, 'tile_platform'],
      [10,  9,  4, 'tile_platform'],
      [14, 11,  4, 'tile_platform'],  // helps cross the gap
      [21,  8,  5, 'tile_brick'],
      [28, 11,  3, 'tile_platform'],
      [33,  7,  6, 'tile_brick'],
      [40, 10,  4, 'tile_platform'],
      [46, 11,  3, 'tile_stone'],
      [51,  7,  5, 'tile_brick'],
      [57, 10,  4, 'tile_platform'],
      [63,  8,  5, 'tile_platform'],
      [69, 10,  4, 'tile_brick'],
      [74, 12,  4, 'tile_stone'],
    ],

    coins: [
      // Intro row
      [2,13],[3,13],[4,13],
      // Platform 1
      [4,10],[5,10],[6,10],[7,10],
      // Platform 2
      [10,8],[11,8],[12,8],[13,8],
      // Over gap
      [15,10],[16,10],[17,10],
      // Platform 3
      [22,7],[23,7],[25,7],
      // Ground coins
      [26,13],[27,13],[29,13],[30,13],
      // High platform
      [33,6],[35,6],[37,6],[38,6],
      // Mid section
      [40,9],[42,9],
      // Stone platform
      [46,10],[47,10],[48,10],
      // Brick high
      [51,6],[52,6],[53,6],[54,6],[55,6],
      // Final stretch
      [63,7],[65,7],[67,7],
      [69,9],[70,9],[71,9],[72,9],
    ],

    enemies: [
      // [col, row, type, patrolLeft, patrolRight]
      [8,  13, 'walker', 6,  12],
      [20, 13, 'walker', 18, 25],
      [30, 13, 'walker', 28, 35],
      [38, 10, 'flyer',  36, 43, 8],  // flyer: extra arg = base row pixel offset
      [45, 13, 'walker', 42, 50],
      [56, 13, 'walker', 53, 61],
      [61,  8, 'flyer',  59, 66, 8],
      [70, 13, 'walker', 68, 75],
    ],

    spikes: [
      [24, 13, 2],
      [43, 13, 1],
      [59, 13, 2],
    ],
  },

  '1-2': {
    id: '1-2', world: 1, stage: 2,
    name: 'Bosque Encantado',
    bg: 'bg_sky', hills: true,
    width: 2880,   // 90 tiles
    goalCoins: 20,
    timeLimit: 220,
    spawn1: [2, 13], spawn2: [3, 13],
    goal:   [87, 13],

    platforms: [
      [0,  14, 10, 'tile_ground'],
      [12, 14, 8,  'tile_ground'],
      [22, 14, 10, 'tile_ground'],
      [34, 14, 6,  'tile_ground'],
      [42, 14, 12, 'tile_ground'],
      [56, 14, 8,  'tile_ground'],
      [66, 14, 22, 'tile_ground'],
      // Platforms
      [3,  11, 3, 'tile_platform'],
      [7,   9, 4, 'tile_brick'],
      [12, 11, 4, 'tile_platform'],
      [17,  8, 5, 'tile_brick'],
      [23, 11, 3, 'tile_stone'],
      [28,  9, 4, 'tile_brick'],
      [34, 12, 4, 'tile_platform'],
      [39,  8, 6, 'tile_brick'],
      [46, 10, 4, 'tile_platform'],
      [52,  7, 5, 'tile_brick'],
      [57, 10, 4, 'tile_platform'],
      [62,  8, 4, 'tile_stone'],
      [67, 11, 3, 'tile_platform'],
      [72,  9, 4, 'tile_brick'],
      [77,  7, 5, 'tile_brick'],
      [83, 11, 4, 'tile_stone'],
    ],

    coins: [
      [2,13],[3,13],[5,13],
      [3,10],[4,10],[5,10],
      [7,8],[8,8],[9,8],[10,8],
      [12,10],[13,10],[14,10],[15,10],
      [17,7],[19,7],[21,7],
      [23,10],[25,10],
      [28,8],[29,8],[30,8],[31,8],
      [39,7],[40,7],[42,7],[44,7],
      [46,9],[47,9],[48,9],[49,9],
      [52,6],[53,6],[54,6],[55,6],[56,6],
      [62,7],[63,7],[64,7],[65,7],
      [72,8],[73,8],[74,8],
      [77,6],[78,6],[79,6],[80,6],[81,6],
    ],

    enemies: [
      [6,  13, 'walker', 4,  10],
      [15, 13, 'walker', 12, 19],
      [25, 13, 'walker', 22, 30],
      [20,  9, 'flyer',  17, 23, 8],
      [36, 13, 'walker', 34, 40],
      [44, 10, 'flyer',  42, 49, 8],
      [48, 13, 'walker', 46, 54],
      [58, 13, 'walker', 56, 62],
      [60,  8, 'flyer',  58, 65, 8],
      [68, 13, 'walker', 66, 73],
      [74, 13, 'walker', 72, 80],
      [79,  9, 'flyer',  77, 84, 8],
    ],

    spikes: [
      [10, 13, 2],
      [20, 13, 2],
      [32, 13, 1],
      [40, 13, 2],
      [54, 13, 2],
      [64, 13, 1],
    ],
  },
};

export const LEVEL_ORDER = ['1-1', '1-2'];

/* ─── Builder ──────────────────────────────────────────────────────────────── */
export function buildLevel(scene, levelId) {
  const data = LEVELS[levelId];
  if (!data) throw new Error(`Level ${levelId} not found`);

  const T = TILE;
  const worldH = 17 * T; // 544

  // ── Platforms ──────────────────────────────────────────────────────────────
  const platforms = scene.physics.add.staticGroup();

  data.platforms.forEach(([col, row, cols, tileKey]) => {
    for (let c = 0; c < cols; c++) {
      const x = (col + c) * T + T/2;
      const y = row * T + T/2;
      platforms.create(x, y, tileKey).refreshBody();
    }
  });

  // ── Coins ──────────────────────────────────────────────────────────────────
  // Use a dynamic group with gravity disabled so sprites support animation
  const coins = scene.physics.add.group({
    classType: Phaser.Physics.Arcade.Sprite,
    allowGravity: false,
    immovable: true,
  });
  data.coins.forEach(([col, row]) => {
    const x = col * T + T/2;
    const y = row * T + T/2;
    const coin = coins.create(x, y, 'coin', 0).setScale(1.2);
    coin.play('coin_spin');
    coin.body.setAllowGravity(false);
    coin.body.setImmovable(true);
  });

  // ── Spikes ─────────────────────────────────────────────────────────────────
  const hazards = scene.physics.add.staticGroup();
  (data.spikes || []).forEach(([col, row, w]) => {
    for (let c = 0; c < w; c++) {
      const x = (col + c) * T + T/2;
      const y = row * T + T/2;
      const spike = hazards.create(x, y, 'tile_spike');
      spike.body.setSize(T - 4, T/2).setOffset(2, T/2);
      spike.refreshBody();
    }
  });

  // ── Goal flag ──────────────────────────────────────────────────────────────
  const [gc, gr] = data.goal;
  const goalX = gc * T + T/2;
  const poleY  = gr * T;
  const pole   = scene.add.image(goalX, poleY - 36, 'flag_pole').setOrigin(0.5, 1);
  const banner = scene.add.image(goalX + 14, poleY - 64, 'flag_banner').setOrigin(0, 0);

  // Gentle waving tween on banner
  scene.tweens.add({ targets: banner, x: goalX + 16, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

  // Goal trigger zone
  const goalZone = scene.add.zone(goalX, gr * T + T/2, T * 2, T * 2);
  scene.physics.add.existing(goalZone, true);

  // ── Enemies ────────────────────────────────────────────────────────────────
  // Enemy creation is handled by GameScene (needs Enemy class), so we return raw data
  const enemyData = data.enemies;

  return {
    data,
    platforms,
    coins,
    hazards,
    goalZone,
    enemyData,
    worldWidth: data.width,
    worldHeight: worldH,
    spawn1Px: [data.spawn1[0] * T + T/2, data.spawn1[1] * T + T/2 - T/2],
    spawn2Px: [data.spawn2[0] * T + T/2, data.spawn2[1] * T + T/2 - T/2],
  };
}

export function getLevel(id) {
  return LEVELS[id];
}

export function nextLevel(id) {
  const idx = LEVEL_ORDER.indexOf(id);
  return idx >= 0 && idx < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[idx + 1] : null;
}
