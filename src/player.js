class Inventory {
    constructor() {
        /** @type {Map<string, number>} */
        this.__content = new Map();
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
     */
    add(item, count) {
        this.set(item, this.get(item) + count);
    }

    /**
     *
     * @param item {string}
     * @return {number}
     */
    get(item) {
        return this.__content.get(item) || 0;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @return {number}
     */
    sum() {
        return [...this.__content.values()].reduce((a, b) => a + b, 0);
    }
}

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
}


class GEOPlayer extends GEOShip {
    constructor(game) {
        super(game, 'white');
        this.x = game.wh;
        this.y = game.hh;
        this.t = 'p';
    }

    step() {
        super.step();
        if (this.game.kp('a')) {
            this.d -= 5;
        } else if (this.game.kp('d')) {
            this.d += 5;
        }

        if (this.game.kp('w')) {
            this.s = 5;
        } else if (this.game.kp('s')) {
            this.s = -3;
        } else {
            this.s = getSliderSpeed();
        }
    }
}

/**
 * @param game {GEG}
 * @param player {GEO}
 * @param isLeft {boolean}
 */
function createLaser(game, player, isLeft) {
    const obj = game.createObject(player.wh, player.hh * 2/3 * (isLeft ? -1 : 1), 0, player);
    obj.h = 3;
    obj.w = player.wh * 2/3;
    obj.s = 7;
    obj.t = 'l';
    /**
     * @param ctx {CanvasRenderingContext2D}
     */
    obj.draw = (ctx) => {
        ctx.strokeStyle = 'aqua';
        ctx.lineWidth = obj.h;
        ctx.beginPath();
        ctx.moveTo(obj.x - obj.wh, obj.y);
        ctx.lineTo(obj.x + obj.wh, obj.y);
        ctx.closePath();
        ctx.stroke();
    }
    MUSIC.play('action').then();

    obj.onscreenleft = () => obj.die();
}
