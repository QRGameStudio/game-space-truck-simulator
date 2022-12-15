class GEOPirate extends GEOShip {
    /**
     *
     * @param game {GEG}
     */
    constructor(game) {
        super(game, 'red');

        this.w = 50;
        this.h = 30;

        /**
         *
         * @type {null|GEOShip}
         */
        this.target = null;
        this.wantedTargetDistance = 30;
        this.maxTargetDistance = 40000;
        this.t = 'pirate';

        this.maxSpeed = 50;
        this.acceleration = 5;
        this.turnSpeed = 1;

        this.__laserTimeout = 500;
        this.__lasersTargets = ['p'];
    }

    draw(ctx) {
        super.draw(ctx);
    }

    step() {
        super.step();
        console.log('Pirate', this.x, this.y, this.target, this.__autopilot);

        if (this.target !== null && (this.target.is_dead || this.distanceFrom(this.target) > this.maxTargetDistance)) {
            this.__autopilot = null;
            this.target = null;
        }

        if (this.target === null) {
            this.target = this.getNearest('p', this.maxTargetDistance) || null;

            if (this.__autopilot === null) {
                const asteroidField = GEOAsteroidField.fields[Math.floor(Math.random() * GEOAsteroidField.fields.length)];
                this.goto(asteroidField.x, asteroidField.y, 300);
            }
        } else {
            const targetDistance = this.distanceFrom(this.target);
            const minTargetDistance = this.r + this.target.r;
            const maxTargetDistance = minTargetDistance + this.wantedTargetDistance;
            const targetPoint = GUt.pointRelativeTo(this.target.cx, this.target.cy, GUt.absoluteAngle(this.target.d + 180), 100, 0);
            this.goto(targetPoint.x, targetPoint.y, maxTargetDistance, this.target.s);
            if (this.rotateTo(this.target.cx, this.target.cy) && targetDistance >= minTargetDistance && targetDistance < this.game.r) {
                this.fireLasers();
            }
        }
    }
}
