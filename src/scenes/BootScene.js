// Character definitions shared across the whole game
export const CHARS = {
  percy: {
    id: 'percy', name: 'Percy Jackson', sub: 'Hijo de Poseidón',
    ability: 'Hielo · Inmune al agua', shoot: 'bullet_ice',
    hair: '#1a1a1a', shirt: '#0D47A1', pants: '#263238',
    speed: 200, jumpPow: -550,
  },
  annabeth: {
    id: 'annabeth', name: 'Annabeth Chase', sub: 'Hija de Atenea',
    ability: 'Aire · Revela pasajes', shoot: 'bullet_wind',
    hair: '#FFD54F', shirt: '#78909C', pants: '#455A64',
    speed: 210, jumpPow: -560,
  },
  grover: {
    id: 'grover', name: 'Grover Underwood', sub: 'Sátiro del Olimpo',
    ability: 'Tierra · Escala muros', shoot: 'bullet_earth',
    hair: '#5D4037', shirt: '#6D4C41', pants: '#3E2723',
    speed: 185, jumpPow: -580,
  },
  harry: {
    id: 'harry', name: 'Harry Potter', sub: 'El Niño que Vivió',
    ability: 'Fuego · Vuelo breve', shoot: 'bullet_fire',
    hair: '#1a1a1a', shirt: '#B71C1C', pants: '#1A237E',
    speed: 195, jumpPow: -555,
  },
  hermione: {
    id: 'hermione', name: 'Hermione Granger', sub: 'La Mejor Bruja',
    ability: 'Rayo · Congela el tiempo', shoot: 'bullet_lightning',
    hair: '#5D4037', shirt: '#4A148C', pants: '#1A237E',
    speed: 190, jumpPow: -545,
  },
  ron: {
    id: 'ron', name: 'Ron Weasley', sub: 'Guardián de Gryffindor',
    ability: 'Plasma · Escudo y destrucción', shoot: 'bullet_plasma',
    hair: '#BF360C', shirt: '#E65100', pants: '#1B5E20',
    speed: 188, jumpPow: -540,
  },
};

export default class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  create() {
    this._p(0.10, 'Pintando cielos…');    this._bg();
    this._p(0.25, 'Tallando baldosas…');  this._tiles();
    this._p(0.45, 'Creando personajes…'); this._players();
    this._p(0.60, 'Invocando enemigos…'); this._enemies();
    this._p(0.75, 'Llenando cofres…');    this._items();
    this._p(0.88, 'Diseñando interfaz…'); this._ui();
    this._p(0.95, 'Creando animaciones…');this._anims();
    this._p(1.00, '¡Aventura lista!');

    this.time.delayedCall(400, () => {
      window.dispatchEvent(new Event('game-ready'));
      this.scene.start('Menu');
    });
  }

  _p(v, tip) {
    window.dispatchEvent(new CustomEvent('game-progress', { detail: { progress: v, tip } }));
  }

  /* ─── canvas helpers ─────────────────────────── */
  _cv(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { c, ctx };
  }
  _img(key, w, h, fn) {
    const { c, ctx } = this._cv(w, h);
    fn(ctx);
    this.textures.addImage(key, c);
  }
  _sheet(key, w, h, fw, fh, fn) {
    const { c, ctx } = this._cv(w, h);
    fn(ctx);
    this.textures.addSpriteSheet(key, c, { frameWidth: fw, frameHeight: fh });
  }

  /* ─── background ──────────────────────────────── */
  _bg() {
    this._img('bg_sky', 960, 544, ctx => {
      const g = ctx.createLinearGradient(0, 0, 0, 544);
      g.addColorStop(0,   '#4FC3F7');
      g.addColorStop(0.6, '#81D4FA');
      g.addColorStop(1,   '#B3E5FC');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 960, 544);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      [[110,70,90,30],[290,45,110,36],[540,85,75,26],[760,55,95,32]].forEach(([x,y,w,h]) => {
        ctx.beginPath();
        ctx.ellipse(x, y, w*.5, h*.5, 0, 0, Math.PI*2);
        ctx.ellipse(x-w*.25, y+h*.1, w*.35, h*.4, 0, 0, Math.PI*2);
        ctx.ellipse(x+w*.25, y+h*.1, w*.35, h*.4, 0, 0, Math.PI*2);
        ctx.fill();
      });
    });

    this._img('bg_hills', 1920, 200, ctx => {
      ctx.fillStyle = '#81C784';
      for (let i = 0; i < 7; i++) {
        ctx.beginPath(); ctx.ellipse(i*280+100, 180, 130, 95, 0, Math.PI, 0); ctx.fill();
      }
      ctx.fillStyle = '#66BB6A';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath(); ctx.ellipse(i*380+120, 192, 160, 110, 0, Math.PI, 0); ctx.fill();
      }
    });
  }

  /* ─── tiles ───────────────────────────────────── */
  _tiles() {
    const T = 32;

    this._img('tile_ground', T, T, ctx => {
      ctx.fillStyle = '#795548'; ctx.fillRect(0,0,T,T);
      ctx.fillStyle = '#4CAF50'; ctx.fillRect(0,0,T,8);
      ctx.fillStyle = '#388E3C'; ctx.fillRect(0,6,T,2);
      ctx.fillStyle = '#5D4037';
      [[3,11,5,4],[12,9,5,5],[22,13,4,4]].forEach(([x,y,w,h])=>ctx.fillRect(x,y,w,h));
    });

    this._img('tile_platform', T, T, ctx => {
      ctx.fillStyle = '#8D6E63'; ctx.fillRect(0,0,T,T);
      ctx.fillStyle = '#A1887F'; ctx.fillRect(1,1,T-2,6);
      ctx.fillStyle = '#6D4C41';
      for (let x=0;x<T;x+=8) ctx.fillRect(x,0,1,T);
      ctx.fillRect(0,0,T,1); ctx.fillRect(0,T-1,T,1);
    });

    this._img('tile_brick', T, T, ctx => {
      ctx.fillStyle = '#C62828'; ctx.fillRect(0,0,T,T);
      ctx.fillStyle = '#D32F2F';
      [[1,1,14,14],[17,1,14,14],[9,17,14,14],[25,17,14,14]].forEach(([x,y,w,h])=>ctx.fillRect(x,y,w,h));
      ctx.fillStyle = '#8B0000';
      ctx.fillRect(0,16,T,2); ctx.fillRect(8,0,2,16); ctx.fillRect(24,16,2,16);
    });

    this._img('tile_stone', T, T, ctx => {
      ctx.fillStyle = '#546E7A'; ctx.fillRect(0,0,T,T);
      ctx.fillStyle = '#607D8B';
      [[2,2,13,13],[17,2,13,13],[9,18,13,12]].forEach(([x,y,w,h])=>ctx.fillRect(x,y,w,h));
      ctx.fillStyle = '#37474F';
      ctx.fillRect(0,16,T,2); ctx.fillRect(16,0,2,16);
    });

    this._img('tile_spike', T, T, ctx => {
      ctx.fillStyle = '#455A64'; ctx.fillRect(0, T-5, T, 5);
      ctx.fillStyle = '#546E7A';
      [[4,T],[12,T-2],[20,T]].forEach(([px,bot]) => {
        ctx.beginPath(); ctx.moveTo(px, bot); ctx.lineTo(px+4, 3); ctx.lineTo(px+8, bot); ctx.fill();
      });
    });

    this._img('flag_pole', 6, 72, ctx => {
      ctx.fillStyle = '#9E9E9E'; ctx.fillRect(2,0,2,72);
      ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.arc(3,4,4,0,Math.PI*2); ctx.fill();
    });

    this._img('flag_banner', 28, 20, ctx => {
      ctx.fillStyle = '#F44336'; ctx.fillRect(0,0,28,20);
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(5,5,18,10);
      ctx.fillStyle = '#F44336'; ctx.fillRect(10,7,8,6);
    });
  }

  /* ─── player sprites ──────────────────────────── */
  _players() {
    const FW=24, FH=32;
    // 4 frames: idle, run1, run2, jump
    const ANIM=[
      {ll:0,  lr:0,  al:0,  ar:0,  dy:0 },
      {ll:-4, lr:4,  al:4,  ar:-4, dy:0 },
      {ll:4,  lr:-4, al:-4, ar:4,  dy:0 },
      {ll:-3, lr:-3, al:-3, ar:-3, dy:-2},
    ];

    Object.values(CHARS).forEach(ch => {
      this._sheet(`player_${ch.id}`, FW*4, FH, FW, FH, ctx => {
        ANIM.forEach((a, f) => {
          const bx = f*FW;
          // Head / skin
          ctx.fillStyle = '#FFCC80'; ctx.fillRect(bx+6, 2+a.dy, 12, 11);
          // Hair
          ctx.fillStyle = ch.hair;   ctx.fillRect(bx+6, 2+a.dy, 12, 4);
          ctx.fillRect(bx+6, 2+a.dy, 3, 8);
          // Eyes
          ctx.fillStyle = '#1a1a1a'; ctx.fillRect(bx+9, 6+a.dy, 2,2); ctx.fillRect(bx+15, 6+a.dy, 2,2);
          // Shirt
          ctx.fillStyle = ch.shirt;  ctx.fillRect(bx+5, 13+a.dy, 14,10);
          // Arms
          ctx.fillRect(bx+2,  13+a.dy+a.al, 4, 8);
          ctx.fillRect(bx+18, 13+a.dy+a.ar, 4, 8);
          // Hands
          ctx.fillStyle = '#FFCC80';
          ctx.fillRect(bx+2,  13+a.dy+a.al+7, 4, 3);
          ctx.fillRect(bx+18, 13+a.dy+a.ar+7, 4, 3);
          // Pants
          ctx.fillStyle = ch.pants;
          const hl=Math.max(2, 9+a.ll), hr=Math.max(2, 9+a.lr);
          ctx.fillRect(bx+5,  23+a.dy, 6, hl);
          ctx.fillRect(bx+13, 23+a.dy, 6, hr);
          // Shoes
          ctx.fillStyle = '#212121';
          ctx.fillRect(bx+4,  23+a.dy+hl, 7, 3);
          ctx.fillRect(bx+12, 23+a.dy+hr, 7, 3);
          // Character-specific detail (frame 0 only for clarity)
          if (f===0) this._charDetail(ctx, ch, bx, a.dy);
        });
      });

      // Portrait for char-select (64×64)
      this._img(`portrait_${ch.id}`, 64, 64, ctx => {
        ctx.fillStyle = ch.shirt + '55';
        ctx.beginPath(); ctx.arc(32,32,31,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle = ch.shirt;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(32,32,31,0,Math.PI*2); ctx.stroke();
        // Mini character centred
        const s=1.6, ox=32-12*s, oy=8;
        ctx.fillStyle='#FFCC80'; ctx.fillRect(ox+6*s, oy, 12*s, 11*s);
        ctx.fillStyle=ch.hair;   ctx.fillRect(ox+6*s, oy, 12*s, 4*s);
        ctx.fillStyle='#1a1a1a'; ctx.fillRect(ox+9*s, oy+4*s, 2*s, 2*s); ctx.fillRect(ox+14*s, oy+4*s, 2*s, 2*s);
        ctx.fillStyle=ch.shirt;  ctx.fillRect(ox+5*s, oy+11*s, 14*s, 10*s);
        ctx.fillStyle=ch.pants;  ctx.fillRect(ox+5*s, oy+21*s, 5*s, 8*s); ctx.fillRect(ox+12*s, oy+21*s, 5*s, 8*s);
      });
    });
  }

  _charDetail(ctx, ch, bx, dy) {
    switch (ch.id) {
      case 'harry':
        ctx.strokeStyle='#333'; ctx.lineWidth=1;
        ctx.strokeRect(bx+8, 5+dy, 4,3); ctx.strokeRect(bx+13,5+dy,4,3);
        ctx.fillStyle='#F44336'; ctx.fillRect(bx+11,3+dy,1,4);
        break;
      case 'hermione':
        ctx.fillStyle='#5D4037'; ctx.fillRect(bx+1,15+dy,2,7);
        break;
      case 'grover':
        ctx.fillStyle='#5D4037'; ctx.fillRect(bx+7,0+dy,2,4); ctx.fillRect(bx+15,0+dy,2,4);
        break;
      case 'percy':
        ctx.fillStyle='#00BCD4'; ctx.fillRect(bx+9,6+dy,2,2); ctx.fillRect(bx+15,6+dy,2,2);
        break;
      case 'ron':
        ctx.fillStyle='#FF7043'; ctx.fillRect(bx+6,0+dy,12,3);
        break;
      case 'annabeth':
        ctx.fillStyle='#FFD740'; ctx.fillRect(bx+4,3+dy,16,3);
        break;
    }
  }

  /* ─── enemies ─────────────────────────────────── */
  _enemies() {
    // Walker: 32×24, 2 frames
    this._sheet('enemy_walker', 64, 24, 32, 24, ctx => {
      [0,1].forEach(f => {
        const bx=f*32, lo=f?3:-3;
        ctx.fillStyle='#8B0000';
        ctx.beginPath(); ctx.ellipse(bx+16,10,13,9,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#C62828';
        ctx.beginPath(); ctx.ellipse(bx+16,5,9,6,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#FFFFFF';
        ctx.fillRect(bx+6,4,5,5); ctx.fillRect(bx+21,4,5,5);
        ctx.fillStyle='#1a1a1a'; ctx.fillRect(bx+8,5,2,3); ctx.fillRect(bx+22,5,2,3);
        ctx.fillStyle='#1a1a1a'; ctx.fillRect(bx+6,3,7,2); ctx.fillRect(bx+19,3,7,2);
        ctx.fillStyle='#3E2723';
        ctx.fillRect(bx+4,  18+lo, 9, 6);
        ctx.fillRect(bx+19, 18-lo, 9, 6);
      });
    });

    // Flyer: 24×22, 2 frames
    this._sheet('enemy_flyer', 48, 22, 24, 22, ctx => {
      [0,1].forEach(f => {
        const bx=f*24, wo=f?-5:5;
        ctx.fillStyle='#4A148C';
        ctx.beginPath(); ctx.ellipse(bx+12,14,7,8,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#7B1FA2';
        ctx.beginPath();
        ctx.moveTo(bx+5,14); ctx.lineTo(bx+0,8+wo); ctx.lineTo(bx+4,18); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(bx+19,14); ctx.lineTo(bx+24,8+wo); ctx.lineTo(bx+20,18); ctx.fill();
        ctx.fillStyle='#FF1744'; ctx.fillRect(bx+8,10,3,3); ctx.fillRect(bx+14,10,3,3);
        ctx.fillStyle='#FFFFFF'; ctx.fillRect(bx+9,18,2,4); ctx.fillRect(bx+14,18,2,4);
      });
    });
  }

  /* ─── collectibles ────────────────────────────── */
  _items() {
    // Coin: 16×16, 4 frames (spin squish)
    this._sheet('coin', 64, 16, 16, 16, ctx => {
      [14,10,4,10].forEach((w,f) => {
        const bx=f*16, cx=bx+8, cy=8;
        ctx.fillStyle='#FFD700';
        ctx.beginPath(); ctx.ellipse(cx,cy,w/2,7,0,0,Math.PI*2); ctx.fill();
        if (w>5) {
          ctx.fillStyle='#FFF9C4';
          ctx.beginPath(); ctx.ellipse(cx-1,cy-1,w/4,3.5,0,0,Math.PI*2); ctx.fill();
        }
      });
    });

    // Gem: 16×16
    this._img('gem', 16, 16, ctx => {
      ctx.fillStyle='#E91E63';
      ctx.beginPath(); ctx.moveTo(8,1); ctx.lineTo(15,6); ctx.lineTo(8,15); ctx.lineTo(1,6); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#F48FB1';
      ctx.beginPath(); ctx.moveTo(8,4); ctx.lineTo(12,7); ctx.lineTo(8,12); ctx.lineTo(4,7); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#FFFFFF'; ctx.fillRect(6,4,3,2);
    });

    // Mushroom (extra life): 16×16
    this._img('mushroom', 16, 16, ctx => {
      ctx.fillStyle='#F44336';
      ctx.beginPath(); ctx.arc(8,7,7,Math.PI,0); ctx.fill();
      ctx.fillStyle='#FFCDD2';
      ctx.beginPath(); ctx.arc(5,5,2,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(11,4,2,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#FFF9C4'; ctx.fillRect(4,8,8,7);
      ctx.fillStyle='#1a1a1a'; ctx.fillRect(5,9,2,2); ctx.fillRect(9,9,2,2);
    });

    // Star (power-up): 16×16
    this._img('star', 16, 16, ctx => {
      ctx.fillStyle='#FFD700';
      this._star(ctx,8,8,3,7,5);
      ctx.fillStyle='#FFF59D';
      this._star(ctx,8,8,2,4,5);
    });

    // Bullet variants
    const BULLETS = {
      bullet_fire:      ['#FF7043','#FF1744'],
      bullet_ice:       ['#80DEEA','#00BCD4'],
      bullet_lightning: ['#FFD740','#FF6F00'],
      bullet_wind:      ['#B2EBF2','#4DD0E1'],
      bullet_earth:     ['#A5D6A7','#388E3C'],
      bullet_plasma:    ['#CE93D8','#7B1FA2'],
    };
    Object.entries(BULLETS).forEach(([key,[c1,c2]]) => {
      this._img(key, 10, 6, ctx => {
        ctx.fillStyle=c1; ctx.fillRect(0,0,10,6);
        ctx.fillStyle=c2; ctx.fillRect(1,1,6,4);
        ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.fillRect(1,1,2,2);
      });
    });
  }

  _star(ctx, cx, cy, r1, r2, pts) {
    ctx.beginPath();
    for (let i=0; i<pts*2; i++) {
      const r = i%2===0 ? r2 : r1;
      const a = i*Math.PI/pts - Math.PI/2;
      i===0 ? ctx.moveTo(cx+r*Math.cos(a),cy+r*Math.sin(a))
            : ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a));
    }
    ctx.closePath(); ctx.fill();
  }

  /* ─── UI assets ───────────────────────────────── */
  _ui() {
    this._img('heart', 16, 16, ctx => {
      ctx.fillStyle='#F44336';
      ctx.beginPath();
      ctx.arc(5,5,4,Math.PI,0); ctx.arc(11,5,4,Math.PI,0); ctx.lineTo(8,15);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle='#FF8A80'; ctx.fillRect(4,3,3,2);
    });

    this._img('coin_icon', 12, 12, ctx => {
      ctx.fillStyle='#FFD700'; ctx.beginPath(); ctx.arc(6,6,5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#FFF9C4'; ctx.beginPath(); ctx.arc(5,5,2,0,Math.PI*2); ctx.fill();
    });

    // Panel background (for HUD boxes)
    this._img('hud_panel', 160, 44, ctx => {
      ctx.fillStyle='rgba(0,0,0,0.55)';
      this._roundRect(ctx,0,0,160,44,8);
      ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1;
      this._roundRect(ctx,0,0,160,44,8);
      ctx.stroke();
    });

    // Particle
    this._img('particle', 6, 6, ctx => {
      ctx.fillStyle='#FFD700'; ctx.beginPath(); ctx.arc(3,3,3,0,Math.PI*2); ctx.fill();
    });
  }

  _roundRect(ctx,x,y,w,h,r) {
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
    ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
    ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
    ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
    ctx.closePath();
  }

  /* ─── animations ──────────────────────────────── */
  _anims() {
    Object.keys(CHARS).forEach(id => {
      const k = `player_${id}`;
      this.anims.create({ key:`idle_${id}`,  frames:[{key:k,frame:0}],                                   frameRate:4 });
      this.anims.create({ key:`run_${id}`,   frames:[{key:k,frame:1},{key:k,frame:2}],                   frameRate:8, repeat:-1 });
      this.anims.create({ key:`jump_${id}`,  frames:[{key:k,frame:3}],                                   frameRate:1 });
      this.anims.create({ key:`hurt_${id}`,  frames:[{key:k,frame:0}],                                   frameRate:1 });
    });

    this.anims.create({ key:'coin_spin', frames: this.anims.generateFrameNumbers('coin',{start:0,end:3}), frameRate:8, repeat:-1 });
    this.anims.create({ key:'walk_enemy', frames: this.anims.generateFrameNumbers('enemy_walker',{start:0,end:1}), frameRate:6, repeat:-1 });
    this.anims.create({ key:'fly_enemy',  frames: this.anims.generateFrameNumbers('enemy_flyer', {start:0,end:1}), frameRate:8, repeat:-1 });
  }
}
