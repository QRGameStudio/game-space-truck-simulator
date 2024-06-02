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
        this.name = this.label.text;
        this.icon = GEOPlayer.icon;

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
        /**
         * @type {null|GPoint}
         * @private
         */
        this.__point_last_buy = null;
    }

    async step() {
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
            const stations = await this.getNearests(GEOStation.t);
            // noinspection JSValidateTypes
            this.target = weightedRandomChoice(stations.map((x, i) => ({item: x, weight: (i + 2) ** 2})), true);
        } else {
            if (this.goto(this.target.x, this.target.y, this.wantedTargetDistance, 0)) {
                let salary = 0;
                if (this.__point_last_buy) {
                    salary = Math.round(Math.max(0, Math.log10(this.distanceTo(this.__point_last_buy)) ** 2));
                }

                const to  = GEOStation.transferCargo(this, this.target);
                const from = GEOStation.transferCargo(this.target, this);
                console.debug(`[STS] Trader transferred cargo to ${this.target.name} for ${salary} C`, to, from, this.inventory.size);
                if (salary) {
                    (new GPopup(`${this.label.text} transferred cargo to ${this.target.name} for ${salary} C`)).show();
                }
                this.target = null;
                this.__stay_timeout = (10 + Math.floor(30 * Math.random())) * this.game.fps;
                this.__point_last_buy = this.pos;
            }
        }
    }

    saveDict() {
        return {...super.saveDict(), stayTimeout: this.__stay_timeout, pointLastBuy: this.__point_last_buy};
    }

    loadDict(data) {
        this.__stay_timeout = data.stayTimeout;
        this.__point_last_buy = data.pointLastBuy;
        super.loadDict(data);
    }
}
