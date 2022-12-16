class GEOAsteroidField extends GEO {
    /**
     *
     * @type {GPoint[]}
     */
    static fields = [];
    static guiRenderer = new GRenderer(
        $('.asteroid-fields'),
        {fields: GEOAsteroidField.fields},
        {},
        {gotoObject: (point) => { PLAYER.goto(point.x, point.y); GAME.canvas.focus(); }}
    );

    constructor(game, x, y) {
        super(game);
        this.x = x;
        this.y = y;
        GEOAsteroidField.fields.push({x: Math.floor(x), y: Math.floor(y)});
        GEOAsteroidField.guiRenderer.render();
        this.__field_radius = Math.random() * 1000;
        /**
         *
         * @type {GEO[]}
         */
        this.asteroids = [];
        this.asteroidsCount = Math.floor(Math.random() * this.__field_radius / 10);
        this.generateAsteroids(this.asteroidsCount);
    }

    step() {
        super.step();
        this.asteroids = this.asteroids.filter((a) => !a.isDead);
        if (this.asteroids.length < Math.max(3, 0.1 * this.asteroidsCount)) {

        }
    }

    die() {
        GEOAsteroidField.fields = GEOAsteroidField.fields.filter((p) => p.x !== Math.floor(this.x) || p.y !== Math.floor(this.y));
        GEOAsteroidField.guiRenderer.render();
        super.die();
    }

    /**
     *
     * @param count {number}
     */
    generateAsteroids(count) {
        for (let i = 0; i < count; i++) {
            const x = this.x + 2 * Math.random() * this.__field_radius - this.__field_radius;
            const y = this.y + 2 * Math.random() * this.__field_radius - this.__field_radius;
            const asteroid = createAsteroid(this.game, 30 + Math.random() * 75, x, y)
            asteroid.s = 0;
            this.asteroids.push(asteroid);
        }
    }
}
