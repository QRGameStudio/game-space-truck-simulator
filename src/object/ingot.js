/**
 * @param game {GEG}
 * @param x {number}
 * @param y {number}
 */
function createIngot(game, x, y) {
    let spinSpeed = (random() * 3) - 1.5;

    const obj = game.createObject();
    obj.w = 10;
    obj.h = 20;
    obj.x = x;
    obj.y = y;
    obj.s = 1 + random() * 2;
    obj.d = random() * 360;
    obj.t = 'ingot';
    obj.cwl.add('p');

    obj.step = () => {
        obj.ia += spinSpeed;

        if (obj.distanceFrom(PLAYER) > 2 * game.r) {
            obj.die();
        }
    }

    /** @param other {GEOPlayer} */
    obj.oncollision = (other) => {
        // player hit
        MUSIC.play('success').then();
        other.inventory.add('metal', 1);
        inventoryRenderer.render();
        obj.die();
    };

    /**
     * @param ctx {CanvasRenderingContext2D}
     */
    obj.draw = (ctx) => {
        ctx.fillStyle = 'gray';
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
    }

    return obj;
}
