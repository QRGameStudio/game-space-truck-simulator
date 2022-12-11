const { random, sin, cos, PI } = Math;
const $ = document.querySelector.bind(document);
/**
 * @type {GSongLib}
 */
let music;
/**
 * @type {GScore}
 */
let score;

/** @type {GRenderer} */
let inventoryRenderer;

/** @type {GEO} */
let player;

class Inventory {
    constructor() {
        /** @type {Map<string, number>} */
        this.__content = new Map();
    }

    /**
     *
     * @param item {string}
     * @param count {number}
     */
    set(item, count) {
        this.__content.set(item, count);
    }

    /**
     *
     * @param item {string}
     * @param count {number}
     */
    add(item, count) {
        this.set(item, this.get(item) + count);
    }

    /**
     *
     * @param item {string}
     * @return {number}
     */
    get(item) {
        return this.__content.get(item) || 0;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @return {number}
     */
    sum() {
        return [...this.__content.values()].reduce((a, b) => a + b, 0);
    }
}

/**
 * @param game {GEG}
 * @return {GEO}
 */
function createPlayer(game) {
    const obj = game.createObject();
    obj.data.set('inventory', new Inventory());
    obj.data.set('health', 100);

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
            obj.s = getSliderSpeed();
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
            ctx.strokeStyle = 'yellow';
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
    obj.t = 'l';
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
    music.play('action').then();

    obj.onscreenleft = () => obj.die();
}

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
    obj.s = 1 + random() * 2;
    obj.d = random() * 360;
    obj.t = 'a';
    obj.cwl.add('l');
    obj.cwl.add('p');

    obj.step = () => {
        obj.ia += spinSpeed;
        if (obj.distanceFrom(player) > 2 * game.r) {
            obj.die();
        }
    }

    /** @param other {GEO} */
    obj.oncollision = (other) => {
        switch (other.t) {
            case 'l':
                // laser hit
                // noinspection JSIgnoredPromiseFromCall
                music.play('hit');
                // noinspection JSIgnoredPromiseFromCall
                score.inc(1);
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
                music.play('fail').then();
                other.data.set('health', other.data.get('health') - 15);
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

        if (obj.distanceFrom(player) > 2 * game.r) {
            obj.die();
        }
    }

    /** @param other {GEO} */
    obj.oncollision = (other) => {
        // player hit
        music.play('success').then();
        other.data.get('inventory').add('metal', 1);
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

/**
 * @return {number}
 */
function getSliderSpeed() {
    const val = $('#iS').value;
    if (val > 60) {
        return (val - 50) / 50 * 5;
    } else if (val < 40) {
        return (50 - val) / 50 * -3;
    }
    return 0;
}

function gameEntryPoint() {
    // noinspection JSValidateTypes
    /**
     * @type {HTMLCanvasElement}
     */
    const canvas = $('#game-canvas');
    const game = new GEG(canvas);

    music = new GSongLib();
    score = new GScore();

    game.res = GUt.isLandscape() ? {w: 1920, h: 1080} : {w: 1080, h: 1920};
    game.paused = true;
    game.objects.length = 0;
    game.paused = false;

    player = createPlayer(game);
    game.cameraFollowObject = player;
    inventoryRenderer = new GRenderer($('.inventory'), {player});

    $('#fR').ontouchstart = () => createLaser(game, player, false);
    $('#fL').ontouchstart = () => createLaser(game, player, true);
    const bR = $('#bR');
    const bL = $('#bL');
    bR.ontouchstart = () => game.press('d');
    bR.ontouchend = () => game.release('d');
    bL.ontouchstart = () => game.press('a');
    bL.ontouchend = () => game.release('a');

    for (let i = 0; i < 10; i++) {
        createAsteroid(game);
    }

    function autoSpawnAsteroids() {
        createAsteroid(game);
        setTimeout(() => autoSpawnAsteroids(), 2500 + (15000 * random()));
    }
    autoSpawnAsteroids();

    game.onKeyDown = (key) => {
        if (key === " ") {
            createLaser(game, player, true);
            createLaser(game, player, false);
        }
    }

    game.run();
}

window.onload = gameEntryPoint;
