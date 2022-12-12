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
        this.x = 0;
        this.y = 0;
        this.t = 'p';

        this.rendererPosition = new GRenderer($('.position'), {x: 0, y: 0, asteroidFields: GEOAsteroidField.fields});
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
        } else if (!this.__autopilot) {
            this.s = getSliderSpeed();
        }

        this.rendererPosition.variables.x = Math.floor(this.x / 10);
        this.rendererPosition.variables.y = Math.floor(this.y / 10);
        this.rendererPosition.variables.s = Math.round(this.s);
        this.rendererPosition.render();
    }
}

