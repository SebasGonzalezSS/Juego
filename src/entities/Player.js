import { CHARS } from '../scenes/BootScene.js';

const COYOTE_TIME    = 120; // ms — grace window after leaving platform
const JUMP_BUFFER    = 100; // ms — pre-land jump buffer
const SHOOT_COOLDOWN = 350; // ms
const HURT_DURATION  = 1200; // ms of invincibility after hit
const SPECIAL_COOLDOWN = 8000; // ms

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, charId, keys, playerIndex) {
    super(scene, x, y, `player_${charId}`);
    this._charId  = charId;
    this._charDef = CHARS[charId];
    this._keys    = keys;
    this._pIdx    = playerIndex; // 0 or 1

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics body
    this.body.setSize(14, 28).setOffset(5, 4);
    this.setDepth(10);

    // Stats
    this.lives      = 3;
    this.coins      = 0;
    this.score      = 0;
    this._hp        = 1;  // one hit = die (then respawn with -1 life)
    this._invincible = 0;
    this._shootCD   = 0;
    this._specialCD = 0;

    // Jump tracking
    this._coyoteLeft = 0;
    this._jumpBuffer = 0;
    this._wasOnGround = false;

    // Special state
    this._flying = false;
    this._flyTimer = 0;
    this._shielded = false;
    this._frozen   = false;
    this._frozenTimer = 0;

    // Bullets group reference — set by GameScene
    this.bullets = null;

    // Mobile virtual input (set by GameScene for P1)
    this.mobileInput = null;

    this.play(`idle_${charId}`);
  }

  /* ─── public API ─────────────────────────────────────── */

  get charId() { return this._charId; }
  get alive()  { return this.active; }

  collectCoin(value = 1) {
    this.coins += value;
    this.score += value * 10;
    this._emitParticles(0xFFD700);
  }

  collectMushroom() {
    this.lives = Math.min(this.lives + 1, 5);
    this._emitParticles(0xFF4444);
  }

  collectStar() {
    this._invincible = 8000;
    this.setTint(0xFFD700);
  }

  hurt() {
    if (this._invincible > 0 || !this.active) return;
    this._invincible = HURT_DURATION;
    this.lives -= 1;
    this.setTint(0xff4444);
    this.body.setVelocityY(-400);

    this.scene.cameras.main.shake(200, 0.008);

    this.scene.time.delayedCall(400, () => {
      if (this.active) this.clearTint();
    });

    if (this.lives <= 0) {
      this._die();
    }
  }

  respawn(x, y) {
    this.setPosition(x, y);
    this.body.setVelocity(0, 0);
    this._invincible = 2000;
    this._hp = 1;
    this.setActive(true).setVisible(true);
    this.clearTint();
    this.play(`idle_${this._charId}`);
  }

  activateSpecial() {
    if (this._specialCD > 0) return;
    this._specialCD = SPECIAL_COOLDOWN;

    switch (this._charId) {
      case 'harry':    this._startFly();          break;
      case 'hermione': this._timeFreeze();         break;
      case 'grover':   this._wallClimb();          break;
      case 'ron':      this._shield();             break;
      case 'percy':    this._waterBurst();         break;
      case 'annabeth': this._reveal();             break;
    }
  }

  /* ─── frame update ─────────────────────────────────────── */

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (!this.active) return;

    const dt = delta;
    const k  = this._keys;
    const mb = this.mobileInput;

    const onGround = this.body.blocked.down;
    const speed    = this._charDef.speed;

    // ── Timers ────────────────────────────────────────
    this._invincible  = Math.max(0, this._invincible - dt);
    this._shootCD     = Math.max(0, this._shootCD - dt);
    this._specialCD   = Math.max(0, this._specialCD - dt);
    this._jumpBuffer  = Math.max(0, this._jumpBuffer - dt);

    // Coyote time
    if (onGround) this._coyoteLeft = COYOTE_TIME;
    else          this._coyoteLeft = Math.max(0, this._coyoteLeft - dt);

    // ── Fly mode (Harry) ─────────────────────────────
    if (this._flying) {
      this._flyTimer -= dt;
      if (this._flyTimer <= 0) { this._flying = false; this.body.setAllowGravity(true); }
    }

    // ── Horizontal movement ──────────────────────────
    const goLeft  = k.left.isDown  || mb?.left;
    const goRight = k.right.isDown || mb?.right;

    if (goLeft && !goRight) {
      this.body.setVelocityX(-speed);
      this.setFlipX(true);
    } else if (goRight && !goLeft) {
      this.body.setVelocityX(speed);
      this.setFlipX(false);
    } else {
      this.body.setVelocityX(0);
    }

    // ── Jump ─────────────────────────────────────────
    const jumpPressed = Phaser.Input.Keyboard.JustDown(k.up) || mb?.jumpJustPressed;
    if (mb) mb.jumpJustPressed = false;

    if (jumpPressed) this._jumpBuffer = JUMP_BUFFER;

    const canJump = this._coyoteLeft > 0 || this._flying;
    if (this._jumpBuffer > 0 && canJump) {
      this.body.setVelocityY(this._charDef.jumpPow);
      this._coyoteLeft = 0;
      this._jumpBuffer = 0;
    }

    // ── Shoot ─────────────────────────────────────────
    const shootPressed = Phaser.Input.Keyboard.JustDown(k.shoot) || mb?.shootJustPressed;
    if (mb) mb.shootJustPressed = false;

    if (shootPressed && this._shootCD <= 0 && this.bullets) {
      this._fireBullet();
      this._shootCD = SHOOT_COOLDOWN;
    }

    // ── Special ──────────────────────────────────────
    if (Phaser.Input.Keyboard.JustDown(k.special)) this.activateSpecial();

    // ── Animations ────────────────────────────────────
    const moving = Math.abs(this.body.velocity.x) > 10;
    const anim = !onGround
      ? `jump_${this._charId}`
      : moving
        ? `run_${this._charId}`
        : `idle_${this._charId}`;
    this.play(anim, true);

    // Blink while invincible
    if (this._invincible > 0) {
      this.setAlpha(Math.sin(time / 80) > 0 ? 1 : 0.3);
    } else {
      this.setAlpha(1);
    }
  }

  /* ─── private ─────────────────────────────────── */

  _fireBullet() {
    if (!this.bullets) return;
    const bKey = this._charDef.shoot;
    const dir  = this.flipX ? -1 : 1;
    const bx   = this.x + dir * 14;
    const by   = this.y - 2;

    const b = this.bullets.get(bx, by, bKey);
    if (!b) return;
    b.setActive(true).setVisible(true).setDepth(9);
    b.setTexture(bKey);
    b.body.reset(bx, by);
    b.body.setVelocity(dir * 480, 0);
    b.body.setAllowGravity(false);
    b._owner = this._pIdx;
    b._life  = 1200; // ms

    this._emitParticles(0x64B5F6, 3);
  }

  _die() {
    this.setActive(false).setVisible(false);
    this.scene.events.emit('player-died', this._pIdx);
  }

  _emitParticles(color, count = 6) {
    for (let i = 0; i < count; i++) {
      const p = this.scene.add.image(this.x, this.y, 'particle');
      p.setTint(color).setDepth(20);
      const angle = (i / count) * Math.PI * 2;
      const dist  = 20 + Math.random() * 15;
      this.scene.tweens.add({
        targets: p,
        x: this.x + Math.cos(angle) * dist,
        y: this.y + Math.sin(angle) * dist - 15,
        alpha: 0, scale: 0.3,
        duration: 350,
        ease: 'Quad.easeOut',
        onComplete: () => p.destroy(),
      });
    }
  }

  /* ─── Special abilities ───────────────────────── */

  _startFly() {
    this._flying    = true;
    this._flyTimer  = 3000;
    this.body.setAllowGravity(false);
    this.body.setVelocityY(-300);
    this.setTint(0xFF9800);
    this.scene.time.delayedCall(3000, () => {
      this._flying = false;
      this.body.setAllowGravity(true);
      this.clearTint();
    });
  }

  _timeFreeze() {
    this.scene.events.emit('time-freeze', 4000);
    this.setTint(0xADD8E6);
    this.scene.time.delayedCall(400, () => this.clearTint());
  }

  _wallClimb() {
    // Grover gets a super jump
    this.body.setVelocityY(this._charDef.jumpPow * 1.35);
    this._emitParticles(0x66BB6A, 8);
  }

  _shield() {
    this._invincible = 5000;
    this.setTint(0xCE93D8);
    this.scene.time.delayedCall(5000, () => this.clearTint());
  }

  _waterBurst() {
    this.body.setVelocityX((this.flipX ? -1 : 1) * 600);
    this._invincible = 1000;
    this.setTint(0x00BCD4);
    this.scene.time.delayedCall(600, () => this.clearTint());
  }

  _reveal() {
    this.scene.events.emit('annabeth-reveal');
    this.setTint(0xFFEB3B);
    this.scene.time.delayedCall(400, () => this.clearTint());
  }
}
