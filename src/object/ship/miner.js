class GEOMiner extends GEOShip {
    static t = 'miner';

    /**
     *
     * @param game {GEG}
     */
    constructor(game) {
        super(game, 'green');
        this.t = GEOMiner.t;

        /**
         *
         * @type {null|GEOShip}
         */
        this.target = null;
        this.drone = new GEODrone(this.game, this);
        this.maxTargetDistance = this.game.r * 2;
        this.wantedTargetDistance = 500 + this.r;

        this.maxSpeed = 150;
        this.health = 50;
        this.inventory.size = 6;

        this.w = 40;
        this.h = 60;

        this.cwl.add(GEOStation.t);
    }

    oncollision(other) {
        switch (other.t) {
            case GEOStation.t:
                this.inventory.clear();
                break;
        }
    }

    step() {
        super.step();

        if (!this.drone.docked) {
            this.target = null;
            if (this.drone.idle && this.drone.inRangeForDock) {
                this.drone.dock();
            }
            return;
        }

        if ((this.target !== null && this.target.t !== GEOStation.t && (this.target.isDead || this.distanceFrom(this.target) > this.maxTargetDistance))
        ) {
            this.__autopilot = null;
            this.target = null;
        }

        if (this.target === null) {
            if (this.inventory.full) {
                this.target = this.getNearest(GEOStation.t);
            } else {
                this.target = this.getNearest(GEOAsteroid.t, this.maxTargetDistance) || null;

                if (this.__autopilot === null && GEOAsteroidField.fields.length > 0) {
                    const asteroidFields = this.getNearests(GEOAsteroidField.t);
                    const asteroidField = weightedRandomChoice(asteroidFields.map(x => ({item: x, weight: this.distanceFrom(x)})), true);
                    this.goto(asteroidField.x, asteroidField.y, 0);
                }
            }
        } else {
            this.goto(this.target.x, this.target.y, 0, 0);
            const targetDistance = this.distanceFrom(this.target);
            if (this.target.t !== GEOStation.t && targetDistance < this.wantedTargetDistance) {
                this.target = null;
                if (this.drone.docked) {
                    const stoppingPoint = GUt.pointRelativeTo(this.cx, this.cy, GUt.absoluteAngle(this.d), 500, 0);
                    this.goto(stoppingPoint.x, stoppingPoint.y, this.game.r * 2, 0);
                    this.drone.launch(this);
                }
            }
        }
    }
}
