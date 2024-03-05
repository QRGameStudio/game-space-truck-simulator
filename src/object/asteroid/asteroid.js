class GEOAsteroid extends GEOSavable {
    static t = 'asteroid';

    /**
     * @param game {GEG}
     * @param size {number}
     * @param x {number | null}
     * @param y {number | null}
     * @param field {GEOAsteroidField | null}
     */
    constructor(game, size = 75, x = null, y = null, field = null) {
        super(game);
        this.sides = 8;
        this.gonioCoefficient = 2 * PI / this.sides;

        this.spinSpeed = (random() * 7) - 3.5;
        this.fieldId = field ? field.uuid : null;

        this.w = this.h = size;
        this.x = x === null ? game.w - this.wh + (random() * game.w * 0.05) : x;
        this.y = y === null ? game.h - this.hh + (random() * game.h * 0.05) : y;
        this.s = 0.3 * random();
        this.d = random() * 360;
        this.t = GEOAsteroid.t;
        this.cwl.add('l');
    }

    step() {
        this.ia += this.spinSpeed;
    }

    oncollision(other) {
        switch (other.t) {
            case 'l':
                // laser hit
                // noinspection JSIgnoredPromiseFromCall
                MUSIC.play('boom', 1, 5);
                if (this.w >= 30) {
                    new GEOAsteroid(this.game, this.wh, this.x - this.wh, this.y);
                    new GEOAsteroid(this.game, this.wh, this.x + this.wh, this.y);
                } else {
                    createIngot(this.game, this.cx, this.cy);
                }
                this.die();
                other.die();
                break;
            case 'p':
                // player hit
                MUSIC.play('fail').then();
                other.data.set('health', Math.floor(other.data.get('health') - size));
                this.die();
                break;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        for (let i = 0; i < this.sides; i++) {
            const sideX = this.x - this.wh * cos(this.gonioCoefficient * i);
            const sideY = this.y - this.hh * sin(this.gonioCoefficient * i);
            if (i === 0) {
                ctx.moveTo(sideX, sideY);
            } else {
                ctx.lineTo(sideX, sideY);
            }
        }
        ctx.closePath();
        ctx.strokeStyle = 'orange';
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    saveDict() {
        return {
            ...super.saveDict(),
            size: this.size,
            spinSpeed: this.spinSpeed,
            fieldId: this.fieldId
        };
    }

    loadDict(data) {
        super.loadDict(data);
        this.spinSpeed = data.spinSpeed;
        this.fieldId = data.fieldId;
        this.w = this.h = data.size;
    }
}
