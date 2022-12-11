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

