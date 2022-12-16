/**
 * @param game {GEG}
 * @param player {GEO}
 * @param isLeft {boolean}
 * @param targets {string[]}
 * @return {GEO}
 */
function createLaser(game, player, isLeft, targets) {
    const obj = game.createObject(player.wh, player.hh * 2/3 * (isLeft ? -1 : 1), 0, player);
    obj.h = 3;
    obj.w = player.wh * 2/3;
    obj.s = 7;
    obj.t = 'l';

    targets.forEach((target) => obj.cwl.add(target));

    /**
     * @param ctx {CanvasRenderingContext2D}
     */
    obj.draw = (ctx) => {
        ctx.strokeStyle = 'aqua';
        ctx.lineWidth = obj.h;
        ctx.beginPath();
        ctx.moveTo(obj.x - obj.wh, obj.y);
        ctx.lineTo(obj.x + obj.wh, obj.y);
        ctx.closePath();
        ctx.stroke();
    }
    MUSIC.play('laser', 1, 5).then();

    obj.oncollision = (other) => {
        other.health -= 5;
        obj.die();
    }

    obj.step = () => {
      if (obj.distanceTo(PLAYER) > game.r * 4) {
          obj.die();
      }
    };

    return obj;
}
