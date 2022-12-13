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
            this.d -= this.turnSpeed;
        } else if (this.game.kp('d')) {
            this.d += this.turnSpeed;
        }

        if (this.game.kp('w')) {
            this.accelerate();
            this.cancelGoto();
        } else if (this.game.kp('s')) {
            this.decelerate();
            this.cancelGoto();
        }

        this.rendererPosition.variables.x = Math.floor(this.x);
        this.rendererPosition.variables.y = Math.floor(this.y);
        this.rendererPosition.variables.s = Math.round(this.s);

        if (this.__autopilot !== null) {
            this.rendererPosition.variables.autopilot = {
                time: Math.floor(this.distanceTo(this.__autopilot) / (this.s * this.game.fps))
            }
        } else {
            this.rendererPosition.variables.autopilot = null;
        }

        this.rendererPosition.render();
    }
}

