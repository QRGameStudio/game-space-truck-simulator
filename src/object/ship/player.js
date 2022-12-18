class GEOPlayer extends GEOShip {
    constructor(game) {
        super(game, 'white');
        this.x = 0;
        this.y = 0;
        this.t = 'p';

        this.drone = new GEODrone(this.game, this);

        this.rendererDrone = new GRenderer($('.drone'));
        this.rendererAlert = new GRenderer($('.alert'), {alert: false});
        this.__renderDrone();
        this.rendererPosition = new GRenderer($('.position'),
            {system: '', x: 0, y: 0, inventory: {sum: 0, capacity: 0},
            drone: false});

        this.__playEnginesHumm();
        this.__pirateAlertPlayed = false;
        this.__cargoFullAlertPlayed = false;
        this.__droneIdleAlertPlayed = false;
    }

    die() {
        const nearestBase = this.getNearest(GEOStation.t);
        this.x = nearestBase.cx;
        this.y = nearestBase.cy;
        this.s = 0;
        this.health = 100;
        this.inventory.clear();
        this.game.paused = true;

        SCORE.set(SCORE.get() / 2).then();
        MODAL.alert('Your escape module has arrived to the nearest base', 'Your ship has been destroyed')
            .then(() => this.game.paused = false);
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

        this.__playNearestPirateAlert();
        this.__playCargoFullAlert();
        this.__playDroneIdleAlert();

        /**
         * @type {GEOStation|GEOAsteroidField|null}
         */
        const nearestOrientationPoint = this.getNearest(NAVIGABLE_TYPES, 20000);  // 20 km
        this.rendererPosition.variables.system = nearestOrientationPoint !== null ? nearestOrientationPoint.name : 'Empty space';
        this.rendererPosition.variables.x = Math.floor(this.x);
        this.rendererPosition.variables.y = Math.floor(this.y);
        this.rendererPosition.variables.s = Math.round(this.s);
        this.rendererPosition.variables.maxSpeed = Math.round(this.maxSpeed);

        this.rendererPosition.variables.inventory.sum = this.inventory.sum();
        this.rendererPosition.variables.inventory.capacity = this.inventory.size;
        this.rendererPosition.variables.health = Math.ceil(this.health);

        if (this.__autopilot !== null) {
            const nearestAutopilotSystem = this.game.getNearest(this.__autopilot, NAVIGABLE_TYPES, null, 1);

            this.rendererPosition.variables.autopilot = {
                time: Math.floor(this.distanceTo(this.__autopilot) / (this.s * this.game.fps)),
                x: Math.floor(this.__autopilot.x),
                y: Math.floor(this.__autopilot.y),
                system: nearestAutopilotSystem[0]?.name || 'Unknown'
            }
        } else {
            this.rendererPosition.variables.autopilot = null;
        }

        this.rendererPosition.render();
        this.__renderDrone();
    }

    __playNearestPirateAlert() {
        /**
         *
         * @type {GEOPirate|undefined}
         */
        const nearestPirate = this.getNearest('pirate');

        if (nearestPirate === null) {
            this.__pirateAlertPlayed = false;
            return;
        }

        if (nearestPirate.target !== this) {
            this.__pirateAlertPlayed = false;
            this.rendererAlert.variables.alert = this.__pirateAlertPlayed;
            this.rendererAlert.render();
        } else if (!this.__pirateAlertPlayed) {
            this.__pirateAlertPlayed = true;
            this.rendererAlert.variables.alert = this.__pirateAlertPlayed;
            this.rendererAlert.render();
            MUSIC.play('alert');
        }
    }

    __playCargoFullAlert() {
        if (this.inventory.full && !this.__cargoFullAlertPlayed) {
            this.__cargoFullAlertPlayed = true;
            MUSIC.play('cargoFull', 0, 30);
        } else if (!this.inventory.full && this.__cargoFullAlertPlayed) {
            this.__cargoFullAlertPlayed = false;
        }
    }

    __playDroneIdleAlert() {
        if (this.drone.idle && !this.__droneIdleAlertPlayed) {
            this.__droneIdleAlertPlayed = true;
            MUSIC.play('cargoFull', 0, 30);
        } else if (!this.drone.idle && this.__droneIdleAlertPlayed) {
            this.__droneIdleAlertPlayed = false;
        }
    }


    __renderDrone() {
        const isInDockingRange = () => this.distanceFrom(this.drone) <= 2 * (this.r + this.drone.r);

        if (this.rendererDrone.variables.inRange === isInDockingRange() && this.rendererDrone.variables.docked === this.drone.docked) {
            return;
        }

        this.rendererDrone.variables.docked = this.drone.docked;
        this.rendererDrone.variables.inRange = isInDockingRange();
        this.rendererDrone.functions.launch = () => {
          if (!this.drone.docked) {
              return;
          }
          this.drone.launch({x: this.cx, y: this.cy});
          this.__renderDrone();
        };
        this.rendererDrone.functions.recall = () => {
            this.drone.returnToOwner = true;
        }
        this.rendererDrone.functions.dock = () => {
            if (this.drone.docked) {
                this.drone.returnToOwner = true;
                return;
            }
            this.drone.dock();
            this.__renderDrone();
        };
        this.rendererDrone.render();
    }

    __playEnginesHumm() {
        let sound;
        if (this.s < 30) {
            sound = 'humm0';
        } else if (this.s < 100) {
            sound = 'humm1';
        } else {
            sound = 'humm2';
        }

        const volume = this.s < 1 ? 0 : 5 + 30 * (this.s / this.maxSpeed);

        MUSIC.play(sound, 0, volume).then(() => this.__playEnginesHumm());
    }
}

