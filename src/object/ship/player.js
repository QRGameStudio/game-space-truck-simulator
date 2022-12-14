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
}


class GEOPlayer extends GEOShip {
    constructor(game) {
        super(game, 'white');
        this.x = 0;
        this.y = 0;
        this.t = 'p';

        this.drone = new GEODrone(this.game, this);

        this.rendererDrone = new GRenderer($('.drone'));
        this.__renderDrone();
        this.rendererPosition = new GRenderer($('.position'),
            {x: 0, y: 0, asteroidFields: GEOAsteroidField.fields, inventory: {sum: 0, capacity: 0},
            drone: false});
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

        this.rendererPosition.variables.inventory.sum = this.inventory.sum();
        this.rendererPosition.variables.inventory.capacity = this.inventory.size;
        this.rendererPosition.variables.health = Math.ceil(this.health);

        if (this.__autopilot !== null) {
            this.rendererPosition.variables.autopilot = {
                time: Math.floor(this.distanceTo(this.__autopilot) / (this.s * this.game.fps))
            }
        } else {
            this.rendererPosition.variables.autopilot = null;
        }

        this.rendererPosition.render();
    }

    __renderDrone() {
        this.rendererDrone.variables.docked = this.drone.docked;
        this.rendererDrone.functions.launch = () => {
          if (!this.drone.docked) {
              return;
          }
          this.drone.launch({x: this.cx, y: this.cy});
          this.__renderDrone();
        };
        this.rendererDrone.functions.dock = () => {
            if (this.drone.docked || this.distanceFrom(this.drone) > 2 * (this.r + this.drone.r)) {
                this.drone.returnToOwner = true;
                return;
            }
            this.drone.dock();
            this.__renderDrone();
        };
        this.rendererDrone.render();
    }
}

