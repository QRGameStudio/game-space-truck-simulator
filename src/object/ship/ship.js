/**
 * @typedef {{
 *     x: number,
 *     y: number,
 *     accuracy: number,
 *     slowTo: number,
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
        this.inventory = new Inventory(32);

        /**
         *
         * @type {number}
         */
        this.health = 100;
        this.turnSpeed = 5;
        this.maxSpeed = 300;
        this.acceleration = 30;
        this.color = color;
        this.__canFireLasers = true;
        this.__laserTimeout = 200;
        /**
         * @type {GEOShipAutopilot | null}
         * @private
         */
        this.__autopilot = null;
    }

    draw(ctx) {
        ctx.strokeStyle = this.color;
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
            const speedDownStepsLeft = this.s / this.speedAccelerationPerStep;
            const stepsLeft = (this.distanceTo(this.__autopilot)  - this.__autopilot.accuracy) / this.s;

            if (stepsLeft < speedDownStepsLeft) {
                this.decelerate(Math.max(this.__autopilot.slowTo, 3));
            } else {
                this.accelerate();
            }

            this.rotateTo(this.__autopilot.x, this.__autopilot.y);

            const targetDistance = this.distanceTo(this.__autopilot);
            if (targetDistance < this.__autopilot.accuracy && this.s < 5) {
                this.s = this.__autopilot.slowTo;
                this.__autopilot = null;
            }
        }
    }

    /**
     * How much can this ship accelerate per step
     * @return {number}
     */
    get speedAccelerationPerStep() {
        const speedupSteps = this.acceleration * this.game.fps;
        return this.maxSpeed / speedupSteps;
    }

    /**
     * Accelerates up to the maximal speed
     * @return {boolean} true if maximal speed was reached
     */
    accelerate() {
        const acceleration = this.speedAccelerationPerStep;
        const newSpeed = Math.min(this.maxSpeed, this.s + acceleration);
        this.s = newSpeed;
        return newSpeed === this.maxSpeed;
    }

    /**
     * Decelerates speed up to full stop
     * @param minSpeed {number} minimal speed considered full stop
     * @return {boolean} true if stopped
     */
    decelerate(minSpeed = 0) {
        const acceleration = this.speedAccelerationPerStep;
        const newSpeed = Math.max(minSpeed, this.s - acceleration);
        this.s = newSpeed;
        return newSpeed === minSpeed;
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
            const turnSpeed = Math.max(Math.min(this.turnSpeed, Math.abs(targetDirection - this.d)), this.s * 1.1);
            const relativeDirectionDiff = GUt.relativeAngle(targetDirection - this.d);
            this.d += turnSpeed * (relativeDirectionDiff >= -5 ? 1 : -1);
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
     * @param accuracy {number}
     * @param slowTo {number}
     * @return true if already at the position
     */
    goto(x, y, accuracy = Math.min(this.wh, this.hh), slowTo = 0) {
        accuracy = Math.max(accuracy, 0);

        if (this.distanceTo({x, y}) <= accuracy) {
            return true;
        }
        this.__autopilot = {x, y, accuracy, slowTo};
        return false;
    }

    /**
     * Cancels autopilot
     * @return {undefined}
     */
    cancelGoto() {
        this.__autopilot = null;
    }

    fireLasers() {
        if (!this.__canFireLasers) {
            return;
        }
        this.__canFireLasers = false;
        setTimeout(() => this.__canFireLasers = true, this.__laserTimeout);
        createLaser(this.game, this, true);
        createLaser(this.game, this, false);
    }
}
