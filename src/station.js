class GEOStation extends GEO {
    /**
     *
     * @param game {GEG}
     */
    constructor(game) {
        super(game);
        this.t = 'station';
        this.w = this.h = 120;
        this.__spin_speed = 1;
    }

    step() {
        super.step();
        this.ia += this.__spin_speed;
    }

    draw(ctx) {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 7;
        ctx.strokeRect(this.x - this.wh, this.y - this.hh, this.w, this.h);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Creates new GEO station for the current game
     * @return {GEOStation}
     */
    static new() {
        return new GEOStation(GAME);
    }
}
