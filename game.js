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
        ctx.moveTo(obj.x + obj.wh, obj.y);
        ctx.lineTo(obj.x, obj.y + obj.hh);
        ctx.lineTo(obj.x, obj.y - obj.hh);
        ctx.closePath();
        ctx.stroke();
    }

    return obj;
}

function gameEntryPoint() {
    // noinspection JSValidateTypes
    /**
     * @type {HTMLCanvasElement}
     */
    const canvas = document.getElementById('game-canvas');
    const game = new GEG(canvas);
    const player = createPlayer(game);

    game.run();
}


window.onload = gameEntryPoint;
