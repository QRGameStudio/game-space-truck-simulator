/**
 * @typedef {{
 *     x: number,
 *     y: number,
 *     accuracy: number,
 *     slowTo: number,
 * }} GEOShipAutopilot
 */

class GEOShip extends GEOSavable {
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
        this.__lasersTargets = ['a', 'pirate'];
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

        if (this.health <= 0) {
            this.die();
        }

        if (this.__autopilot !== null) {
            const speedDownStepsLeft = this.s / this.speedAccelerationPerStep;
            const distanceLeft = this.distanceTo(this.__autopilot) - this.__autopilot.accuracy;
            const stepsLeft = distanceLeft / this.s;
            const closingIn = this.s < 1 ? true : this.game.distanceBetween(this.__autopilot, this.nextPos) + 2 * this.s / 3 <= this.distanceTo(this.__autopilot);
            // console.log(closingIn, this.__autopilot, this.game.distanceBetween(this.__autopilot, this.nextPos), this.distanceTo(this.__autopilot), this.x, this.y, this.nextPos);

            if (this.s > this.maxSpeed || !closingIn || stepsLeft < speedDownStepsLeft) {
                this.decelerate(closingIn ? Math.max(this.__autopilot.slowTo, 3) : 0);
            } else {
                this.accelerate();
            }

            this.rotateTo(this.__autopilot.x, this.__autopilot.y);

            const targetDistance = this.distanceTo(this.__autopilot);
            if (targetDistance < this.__autopilot.accuracy && this.s < this.__autopilot.slowTo + 5) {
                this.s = this.__autopilot.slowTo;
                this.__autopilot = null;
            }
        }
    }

    die() {
        super.die();
        new GEOExplosion(GAME, this.x, this.y);
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
        const newSpeed = Math.max(Math.min(minSpeed, this.maxSpeed), this.s - acceleration);
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
            const turnSpeed = this.s > 2 ? Math.max(Math.min(this.turnSpeed, Math.abs(targetDirection - this.d), this.s * 2 / 3), 1) : this.turnSpeed;
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
        createLaser(this.game, this, true, this.__lasersTargets).s += this.s;
        createLaser(this.game, this, false, this.__lasersTargets).s += this.s;
    }

    saveDict() {
        const data = super.saveDict();
        data.autopilot = this.__autopilot;
        data.inventory = this.inventory.stringify();
    }

    loadDict(data) {
        super.loadDict(data);
        this.__autopilot = data.autopilot;
        this.inventory.parse(data.inventory);
    }
}

class Inventory {
    /**
     *
     * @param size {number}
     */
    constructor(size) {
        /** @type {Map<string, number>} */
        this.__content = new Map();
        this.size = size;
    }

    /**
     *
     * @return {boolean}
     */
    get full() {
        return this.sum() >= this.size;
    }

    /**
     *
     * @param item {string}
     * @param count {number}
     */
    set(item, count) {
        this.__content.set(item, count);
    }

    /**
     *
     * @param item {string}
     * @param count {number}
     * @return {boolean}
     */
    add(item, count) {
        if (this.sum() + count  > this.size) {
            return false;
        }
        this.set(item, this.get(item) + count);
        return true;
    }

    /**
     *
     * @param item {string}
     * @return {number}
     */
    get(item) {
        return this.__content.get(item) || 0;
    }

    clear() {
        this.__content.clear();
    }

    /**
     *
     * @return {string[]}
     */
    keys() {
        return [...this.__content.keys()];
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @return {number}
     */
    sum() {
        return [...this.__content.values()].reduce((a, b) => a + b, 0);
    }

    /**
     *
     * @return {string}
     */
    stringify() {
        return JSON.stringify([...this.__content.entries()]);
    }

    /**
     *
     * @param data {string}
     */
    parse(data) {
        this.__content = new Map(JSON.parse(data));
    }
}
