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
