class GEOTrader extends GEOShip {
    static t = 'trader';

    /**
     *
     * @param game {GEG}
     */
    constructor(game) {
        super(game, 'cyan');
        this.t = GEOTrader.t;
        this.label.text = "Trader " + this.label.text;

        /**
         *
         * @type {null|GEOStation}
         */
        this.target = null;
        this.wantedTargetDistance = 100 + this.r;

        this.maxSpeed = 250;
        this.health = 70;
        this.inventory.size = 64;

        this.w = 60;
        this.h = 60;

        this.__stay_timeout = 0;
    }

    step() {
        super.step();

        if (this.__stay_timeout > 0) {
            this.__stay_timeout -= 1;
            return;
        }

        if ((this.target !== null && this.target.isDead )
        ) {
            this.__autopilot = null;
            this.target = null;
        }

        if (this.target === null) {
            const stations = this.getNearests(GEOStation.t);
            // noinspection JSValidateTypes
            this.target = weightedRandomChoice(stations.map((x, i) => ({item: x, weight: (i + 2) ** 2})), true);
        } else {
            if (this.goto(this.target.x, this.target.y, this.wantedTargetDistance, 0)) {
                const to  = GEOStation.transferCargo(this, this.target);
                const from = GEOStation.transferCargo(this.target, this);
                console.debug('[STS] Trader transferred cargo', to, from, this.inventory.size);
                this.target = null;
                this.__stay_timeout = (10 + Math.floor(30 * Math.random())) * this.game.fps;
            }
        }
    }
}
