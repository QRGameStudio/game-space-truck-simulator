/**
 * @param game {GEG}
 * @param size {number}
 * @param x {number | null}
 * @param y {number | null}
 */
function createAsteroid(game, size = 75, x = null, y = null) {
    const sides = 8;
    const gonioCoefficient = 2 * PI / sides;
    let spinSpeed = (random() * 7) - 3.5;

    const obj = game.createObject();
    obj.w = obj.h = size;
    obj.x = x === null ? game.w - obj.wh + (random() * game.w * 0.05) : x;
    obj.y = y === null ? game.h - obj.hh + (random() * game.h * 0.05) : y;
    obj.s = 0.3 * random();
    obj.d = random() * 360;
    obj.t = 'a';
    obj.cwl.add('l');

    obj.step = () => {
        obj.ia += spinSpeed;
    }

    /** @param other {GEO} */
    obj.oncollision = (other) => {
        switch (other.t) {
            case 'l':
                // laser hit
                // noinspection JSIgnoredPromiseFromCall
                MUSIC.play('boom', 1, 5);
                if (obj.w >= 30) {
                    createAsteroid(game, obj.wh, obj.x - obj.wh, obj.y);
                    createAsteroid(game, obj.wh, obj.x + obj.wh, obj.y);
                } else {
                    createIngot(game, obj.cx, obj.cy);
                }
                obj.die();
                other.die();
                break;
            case 'p':
                // player hit
                MUSIC.play('fail').then();
                other.data.set('health', Math.floor(other.data.get('health') - size));
                inventoryRenderer.render();
                obj.die();
                break;
        }
    };

    /**
     * @param ctx {CanvasRenderingContext2D}
     */
    obj.draw = (ctx) => {
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const sideX = obj.x - obj.wh * cos(gonioCoefficient * i);
            const sideY = obj.y - obj.hh * sin(gonioCoefficient * i);
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

    return obj;
}
