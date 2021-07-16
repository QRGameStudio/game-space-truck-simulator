const { random, sin, cos, PI } = Math;

/**
 * @param game {GEG}
 * @return {GEO}
 */
function createPlayer(game) {
    const obj = game.createObject();
    obj.x = game.w / 4;
    obj.y = game.h / 4;
    obj.h = 25;
    obj.w = 75;
    obj.t = 'p';
    obj.step = () => {
        if (game.kp('a')) {
            obj.d -= 5;
        } else if (game.kp('d')) {
            obj.d += 5;
        }

        if (game.kp('w')) {
            obj.s = 5;
        } else if (game.kp('s')) {
            obj.s = -3;
        } else {
            obj.s = 0;
        }
    };
    /**
     * @param ctx {CanvasRenderingContext2D}
     */
    obj.draw = (ctx) => {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 5;
        ctx.beginPath();
        // front
        ctx.moveTo(obj.x + obj.wh, obj.y);
        // bottom right
        ctx.lineTo(obj.x, obj.y + obj.hh);
        // bottom left
        ctx.lineTo(obj.x, obj.y - obj.hh);
        ctx.closePath();
        ctx.stroke();
        if (obj.s > 0 && obj.fwd) {
            ctx.strokeStyle = 'orange';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(obj.x, obj.y + (obj.hh * 2/3));
            ctx.lineTo(obj.x - (obj.wh * random()), obj.y);
            ctx.lineTo(obj.x, obj.y - (obj.hh * 2/3));
            ctx.moveTo(obj.x, obj.y + (obj.hh * 2/3));
            ctx.closePath();
            ctx.stroke();
        }
    }

    obj.onscreenleft = () => moveObjectToMirrorSide(obj);

    return obj;
}

/**
 * @param game {GEG}
 * @param player {GEO}
 * @param isLeft {boolean}
 */
function createLaser(game, player, isLeft) {
    const obj = game.createObject(player.wh, player.hh * 2/3 * (isLeft ? -1 : 1), 0, player);
    obj.h = 3;
    obj.w = player.wh * 2/3;
    obj.s = 7;
    /**
     * @param ctx {CanvasRenderingContext2D}
     */
    obj.draw = (ctx) => {
        ctx.strokeStyle = 'aqua';
        ctx.lineWidth = obj.h;
        ctx.moveTo(obj.x - obj.wh, obj.y);
        ctx.lineTo(obj.x + obj.wh, obj.y);
        ctx.stroke();
    }

    obj.onscreenleft = () => obj.die();
}

/**
 * @param game {GEG}
 */
function createAsteroid(game) {
    const sides = 8;
    const gonioCoefficient = 2 * PI / sides;
    let spinSpeed = (random() * 7) - 3.5;

    const obj = game.createObject();
    obj.w = obj.h = 75;
    obj.x = obj.wh + (random() * (game.w - obj.w));
    obj.y = obj.hh + (random() * (game.h - obj.h));
    obj.s = random() * 3;
    obj.d = random() * 360;
    obj.t = 'a';

    obj.step = () => {
        obj.ia += spinSpeed;
    }

    obj.onscreenleft = () => moveObjectToMirrorSide(obj);

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
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

/**
 * From up to buttom, from left to right and vice versa
 * @param obj {GEO}
 */
function moveObjectToMirrorSide(obj) {
    if (obj.x < 0) {
        obj.x = obj.game.w + obj.wh;
    } else if (obj.x > obj.game.w) {
        obj.x = -obj.wh;
    }
    if (obj.y < 0) {
        obj.y = obj.game.h + obj.h;
    } else if (obj.y > obj.game.h) {
        obj.y = -obj.hh;
    }
}

function gameEntryPoint() {
    // noinspection JSValidateTypes
    /**
     * @type {HTMLCanvasElement}
     */
    const canvas = document.getElementById('game-canvas');
    const game = new GEG(canvas);
    const player = createPlayer(game);

    for (let i = 0; i < 10; i++) {
        createAsteroid(game);
    }

    game.onKeyDown = (key) => {
        if (key === " ") {
            createLaser(game, player, true);
            createLaser(game, player, false);
        }
    }

    game.run();
}

window.onload = gameEntryPoint;
