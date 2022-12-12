/**
 * @typedef {{
 *     x: number,
 *     y: number,
 *     speed: number,
 *     acceleration: number,
 *     accuracy: number
 * }} GEOShipAutopilot
 */

class GEOShip extends GEO {
    /**
     *
     * @param game {GEG}
     * @param color {string}
     */
    constructor(game, color) {
        super(game);
        this.w = 75;
        this.h = 25;
        this.t = 'ship';

        /**
         * @type {Inventory}
         */
        this.inventory = new Inventory();
        /**
         *
         * @type {number}
         */
        this.health = 100;
        this.turnSpeed = 5;
        this.__color = color;
        this.__canFireLasers = true;
        /**
         * @type {GEOShipAutopilot | null}
         * @private
         */
        this.__autopilot = null;
    }

    draw(ctx) {
        ctx.strokeStyle = this.__color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        // front
        ctx.moveTo(this.x + this.wh, this.y);
        // bottom right
        ctx.lineTo(this.x, this.y + this.hh);
        // bottom left
        ctx.lineTo(this.x, this.y - this.hh);
        ctx.closePath();
        ctx.stroke();
        if (this.s > 0 && this.fwd) {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + (this.hh * 2/3));
            ctx.lineTo(this.x - (this.wh * random()), this.y);
            ctx.lineTo(this.x, this.y - (this.hh * 2/3));
            ctx.moveTo(this.x, this.y + (this.hh * 2/3));
            ctx.closePath();
            ctx.stroke();
        }
    }

    step() {
        super.step();
        if (this.__autopilot !== null) {
            const speedupSteps = this.__autopilot.acceleration * this.game.fps;
            const maxSpeedup = this.__autopilot.speed / speedupSteps;
            const speedDownStepsLeft = this.s / maxSpeedup;
            const stepsLeft = (this.distanceTo(this.__autopilot)  - this.__autopilot.accuracy) / this.s;

            if (stepsLeft < speedDownStepsLeft && this.s > 3) {
                this.s -= maxSpeedup;
            } else if (this.s < this.__autopilot.speed) {
                this.s += maxSpeedup;
            }

            this.rotateTo(this.__autopilot.x, this.__autopilot.y);

            if (this.distanceTo(this.__autopilot) - this.__autopilot.accuracy < this.s && this.s < 5) {
                this.s = 0;
                this.__autopilot = null;
            }
        }
    }

    /**
     * Rotates to face coordinates
     * @param x {number} target x-coordinates
     * @param y {number} target y-coordinates
     * @return {boolean} true if rotations is finished, false if more steps are required
     */
    rotateTo(x, y) {
        const targetDirection = this.angleTo({x, y});
        const directionDiff = Math.abs(this.d - targetDirection);
        if (directionDiff > 5) {
            const turnSpeed = Math.min(this.turnSpeed, Math.abs(targetDirection - this.d), Math.max(this.s / 2, 1));
            this.d += turnSpeed;
            return false;
        } else if (directionDiff > 2) {
            this.d = targetDirection;
        }
        return true;
    }

    /**
     * Set autopilot to go to a location
     * @param x {number}
     * @param y {number}
     */
    goto(x, y) {
        this.__autopilot = {x, y, speed: 300, accuracy: 0, acceleration: 30};
    }

    fireLasers() {
        if (!this.__canFireLasers) {
            return;
        }
        this.__canFireLasers = false;
        setTimeout(() => this.__canFireLasers = true, 200);

        createLaser(this.game, this, true);
        createLaser(this.game, this, false);
    }
}
