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
        {gotoObject: (point) => PLAYER.goto(point.x, point.y, 200)}
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

        if (this.distanceFrom(PLAYER) < this.r * 5) {
            const metal = PLAYER.inventory.get('metal');
            if (metal) {
                MUSIC.play('successLong').then();
                SCORE.inc(metal).then(() => PLAYER.inventory.set('metal', 0));
            }
        }
    }

    draw(ctx) {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 7;
        ctx.strokeRect(this.x - this.wh, this.y - this.hh, this.w, this.h);
    }
}
