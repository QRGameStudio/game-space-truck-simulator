class GEOPirate extends GEOShip {
    /**
     *
     * @param game {GEG}
     */
    constructor(game) {
        super(game, 'red');

        /**
         *
         * @type {null|GEOShip}
         */
        this.target = null;
        this.wantedTargetDistance = 30;
        this.maxTargetDistance = 10000;
        this.t = 'pirate';

        this.maxSpeed = 350;

        this.__laserTimeout = 500;
    }

    draw(ctx) {
        super.draw(ctx);
    }

    step() {
        super.step();

        if (this.target !== null && (this.target.is_dead || this.distanceFrom(this.target) > this.maxTargetDistance)) {
            this.target = null;
        }

        if (this.target === null) {
            this.maxSpeed = 300;
            this.acceleration = 30;
            this.target = this.getNearest('p') || null;
        } else {
            this.maxSpeed = this.target.s * 1.1;
            this.acceleration = this.target.acceleration * 0.8;
            const targetDistance = this.distanceFrom(this.target);
            const minTargetDistance = this.r + this.target.r;
            const maxTargetDistance = minTargetDistance + this.wantedTargetDistance;
            const targetPoint = GUt.pointRelativeTo(this.target.cx, this.target.cy, GUt.absoluteAngle(this.target.d + 180), 100, 0);
            this.goto(targetPoint.x, targetPoint.y, maxTargetDistance, this.target.s);
            if (this.rotateTo(this.target.cx, this.target.cy) && targetDistance > minTargetDistance && targetDistance < 2 * maxTargetDistance) {
                this.fireLasers();
            }
        }
    }
}
