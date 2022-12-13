class GEODrone extends GEOShip {
    /**
     *
     * @param game {GEG}
     * @param owner {GEOShip}
     */
    constructor(game, owner) {
        super(game, owner.color);

        this.w = 25;
        this.h = 25;
        this.maxSpeed = 30;
        this.turnSpeed = 3;

        this.owner = owner;
        this.returnToOwner = false;
        this.maxOwnerDistance = Math.min(this.game.w, this.game.h);

        /**
         *
         * @type {null|GEO}
         */
        this.target = null;
        this.wantedTargetDistance = 120;
        this.maxTargetDistance = 1000;
        this.t = 'drone';

        this.__laserTimeout = 2000;
    }

    step() {
        super.step();

        if (this.returnToOwner || this.distanceFrom(this.owner) > this.maxOwnerDistance) {
            this.returnToOwner = true;
            this.target = null;

            if (this.goto(this.owner.cx, this.owner.cy, this.wantedTargetDistance)) {
                this.returnToOwner = false;
            }
        } else {
            if (this.target !== null && (this.target.is_dead || this.distanceFrom(this.target) > this.maxTargetDistance)) {
                this.target = null;
            }

            if (this.target === null) {
                this.target = this.getNearest('ingot') || this.getNearest('a') || null;
            } else {
                switch (this.target.t) {
                    case 'a':
                        const maxTargetDistance = this.r + this.wantedTargetDistance + this.target.r - this.target.s * 2;
                        if (this.goto(this.target.cx, this.target.cy, maxTargetDistance, this.target.s * 2) && this.rotateTo(this.target.cx, this.target.cy)) {
                            console.log('firing lasers');
                            this.fireLasers();
                        }
                        break;
                    case 'ingot':
                        this.goto(this.target.cx, this.target.cy);
                        break;
                }
            }
        }
    }
}
