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
        this.__color = color;
        this.__canFireLasers = true;
        /**
         * @type {GPoint | null}
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
            const stepsSpeedup = 60;
            const cruiseSpeed = 5;
            const targetDirection = this.angleTo(this.__autopilot);

            const stepsLeft = this.distanceTo(this.__autopilot) / cruiseSpeed;

            if (stepsLeft < stepsSpeedup && this.s > 3 && this.s > cruiseSpeed / stepsLeft) {
                this.s -= cruiseSpeed / stepsSpeedup;
            } else if (this.s < cruiseSpeed) {
                this.s += cruiseSpeed / stepsSpeedup;
            }

            if (Math.abs(this.d - targetDirection) > 1) {
                const turnSpeed = Math.min(Math.abs(targetDirection - this.d), this.s / 2);
                this.d += turnSpeed * ((targetDirection - this.d) % 360 <= 180 ? 1 : -1);
            }

            if (this.distanceTo(this.__autopilot) < 1.5 * cruiseSpeed) {
                this.s = 0;
                this.__autopilot = null;
            }
        }
    }

    /**
     *
     * @param x {number}
     * @param y {number}
     */
    goto(x, y) {
        this.__autopilot = {x, y};
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
