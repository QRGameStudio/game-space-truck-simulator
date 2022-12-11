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

/**
 * @param game {GEG}
 * @return {GEO}
 */
function createPlayer(game) {
    const obj = game.createObject();
    obj.data.set('inventory', new Inventory());
    obj.data.set('health', 100);

    obj.x = game.w / 4;
    obj.y = game.h / 4;
    obj.h = 25;
    obj.w = 75;
    obj.t = 'p';
    obj.step = () => {
        if (game.kp('a')) {
            obj.d -= 5;
        } else if (game.kp('d')) {
            obj.d += 5;
        }

        if (game.kp('w')) {
            obj.s = 5;
        } else if (game.kp('s')) {
            obj.s = -3;
        } else {
            obj.s = getSliderSpeed();
        }
    };
    /**
     * @param ctx {CanvasRenderingContext2D}
     */
    obj.draw = (ctx) => {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 5;
        ctx.beginPath();
        // front
        ctx.moveTo(obj.x + obj.wh, obj.y);
        // bottom right
        ctx.lineTo(obj.x, obj.y + obj.hh);
        // bottom left
        ctx.lineTo(obj.x, obj.y - obj.hh);
        ctx.closePath();
        ctx.stroke();
        if (obj.s > 0 && obj.fwd) {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(obj.x, obj.y + (obj.hh * 2/3));
            ctx.lineTo(obj.x - (obj.wh * random()), obj.y);
            ctx.lineTo(obj.x, obj.y - (obj.hh * 2/3));
            ctx.moveTo(obj.x, obj.y + (obj.hh * 2/3));
            ctx.closePath();
            ctx.stroke();
        }
    }

    return obj;
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
    music.play('action').then();

    obj.onscreenleft = () => obj.die();
}
