class GEOStation extends GEOSavable {
    /**
     *
     * @type {(GPoint & {name: string})[]}
     */
    static stations = [];

    static t = 'space-station';

    static icon = GUt.ud('8J+PsA==');

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
        this.t = GEOStation.t;
        this.w = this.h = 120;
        this.__spin_speed = 1;
        this.icon = GEOStation.icon;
        this.name = randomName(5, 10) + ' station';
        this.label = new GEOLabel(game, this, this.name);

        GEOStation.stations.push({x: this.x, y: this.y, name: this.name});
    }

    step() {
        super.step();
        this.ia += this.__spin_speed;

        if (this.distanceFrom(PLAYER) < this.r * 5 && PLAYER.s === 0) {
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

    saveDict() {
        return {
            ...super.saveDict(),
            name: this.name
        };
    }

    loadDict(data) {
        this.name = this.label.text = data.name;
        super.loadDict(data);
    }
}
