class GEOAsteroidField extends GEO {
    /**
     *
     * @type {GPoint[]}
     */
    static fields = [];

    constructor(game, x, y) {
        super(game);
        this.x = x;
        this.y = y;
        GEOAsteroidField.fields.push({x: Math.floor(x), y: Math.floor(y)});
        this.__field_radius = Math.random() * 1000;
        this.generateAsteroids(Math.floor(Math.random() * this.__field_radius / 10))
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
        }
    }
}
