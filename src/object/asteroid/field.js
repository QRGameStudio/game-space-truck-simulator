class GEOAsteroidField extends GEO {
    /**
     *
     * @type {(GPoint & {id: number, name: string})[]}
     */
    static fields = [];

    static t = 'asteroid-field';

    constructor(game, x, y) {
        super(game);
        this.x = x;
        this.y = y;
        this.t = GEOAsteroidField.t;
        this.name = randomName(5, 10) + ' field';

        GEOAsteroidField.fields.push({x: Math.floor(x), y: Math.floor(y), id: this.id, name: this.name});
        this.__field_radius = Math.random() * 1000;
        /**
         *
         * @type {GEO[]}
         */
        this.asteroids = [];
        this.minAsteroids = 3;
        this.asteroidsCount = this.minAsteroids + Math.floor(Math.random() * this.__field_radius / 10);
        this.generateAsteroids(this.asteroidsCount);
    }

    step() {
        super.step();
        this.asteroids = this.asteroids.filter((a) => !a.isDead);
        if (this.asteroids.length < Math.max(this.minAsteroids, 0.1 * this.asteroidsCount)) {
            console.log('field die');
            this.die();
        }
    }

    die() {
        const index = GEOAsteroidField.fields.findIndex((x) => x.id === this.id);
        if (index > -1) {
            GEOAsteroidField.fields.splice(index, 1);
        }
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
