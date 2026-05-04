import { TILE } from '../main.js';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type, patrolLeft, patrolRight, baseY) {
    const key    = type === 'flyer' ? 'enemy_flyer' : 'enemy_walker';
    const animKey = type === 'flyer' ? 'fly_enemy' : 'walk_enemy';
    super(scene, x, y, key);

    this._type       = type;
    this._patrolLeft  = patrolLeft  * TILE;
    this._patrolRight = patrolRight * TILE;
    this._baseY      = baseY ?? y;
    this._dir        = 1;
    this._alive      = true;
    this._hurtTimer  = 0;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.play(animKey);

    if (type === 'flyer') {
      // Flyers ignore gravity and float
      this.body.setAllowGravity(false);
      this.body.setSize(20, 18);
      this._floatT = 0;
    } else {
      this.body.setSize(28, 20);
      this.body.setOffset(2, 4);
    }
  }

  get alive() { return this._alive; }

  stomp(playerVelocityY) {
    if (!this._alive) return;
    this._alive = false;
    this.body.setVelocity(0, 0);
    this.body.setAllowGravity(false);
    this.setTint(0xff4444);
    this.scene.tweens.add({
      targets: this, scaleY: 0, y: this.y + 8, alpha: 0,
      duration: 250, ease: 'Quad.easeIn',
      onComplete: () => this.destroy(),
    });
    // Particle burst
    for (let i = 0; i < 6; i++) {
      const p = this.scene.add.image(this.x, this.y, 'particle').setScale(0.8);
      const angle = (i / 6) * Math.PI * 2;
      this.scene.tweens.add({
        targets: p, x: this.x + Math.cos(angle) * 30, y: this.y + Math.sin(angle) * 30 - 20,
        alpha: 0, duration: 400, ease: 'Quad.easeOut', onComplete: () => p.destroy(),
      });
    }
  }

  takeDamage() {
    this.stomp(0);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (!this._alive) return;

    const dt = delta / 1000;
    const SPEED = this._type === 'flyer' ? 80 : 65;

    this._dir = this.x < this._patrolLeft  ? 1
              : this.x > this._patrolRight ? -1
              : this._dir;

    if (this._type === 'flyer') {
      this._floatT += dt * 2.0;
      this.body.setVelocityX(this._dir * SPEED);
      const targetY = this._baseY + Math.sin(this._floatT) * 18;
      this.body.setVelocityY((targetY - this.y) * 8);
    } else {
      this.body.setVelocityX(this._dir * SPEED);
    }

    // Face movement direction
    this.setFlipX(this._dir < 0);
  }
}
