class GEOStation extends GEO {
    /**
     *
     * @type {GPoint[]}
     */
    static stations = [];
    static guiRenderer = new GRenderer(
        $('.space-stations'),
        {stations: GEOStation.stations},
        {},
        {gotoObject: (point) => player.goto(point.x, point.y)}
    );

    /**
     *
     * @param game {GEG}
     * @param x {number} x-position
     * @param y {number} y-position
     */
    constructor(game, x, y) {
        super(game);
        this.x = x;
        this.y = y;
        this.t = 'station';
        this.w = this.h = 120;
        this.__spin_speed = 1;
        GEOStation.stations.push({x: this.x, y: this.y});
        GEOStation.guiRenderer.render();
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
