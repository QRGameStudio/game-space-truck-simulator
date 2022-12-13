const { random, sin, cos, PI } = Math;
const $ = document.querySelector.bind(document);

/** @type {GEOPlayer} */
let PLAYER;

// !G.import('src/index.js')

/**
 * @type {GSongLib}
 */
const MUSIC = new GSongLib();

/**
 *
 * @type {GScore}
 */
const SCORE = new GScore();

/** @type {GEG} */
let GAME;

function start() {
    // noinspection JSValidateTypes
    /**
     * @type {HTMLCanvasElement}
     */
    const canvas = $('#game-canvas');
    GAME = new GEG(canvas);

    GAME.res = GUt.isLandscape() ? {w: 1920, h: 1080} : {w: 1080, h: 1920};

    PLAYER = new GEOPlayer(GAME);
    GAME.cameraFollowObject = PLAYER;

    new GEOStation(GAME, 0, 0);

    (() => {
        const dustCount = 100;
        GAME.onStep = () => {
            if (GEODust.count < dustCount * Math.log2(Math.abs(PLAYER.s) + 1)) {
                new GEODust(GAME);
            }
        };

        for (let i = 0; i < dustCount / 2; i++) {
            new GEODust(GAME, true);
        }
    })();

    GAME.onKeyDown = (key) => {
        if (key === " ") {
            PLAYER.fireLasers();
        }
    }
    GAME.onClick = (x, y) => {
        const pointer = GAME.createObject(x, y);
        pointer.draw = (ctx) => {
            ctx.fillStyle = 'pink';
            ctx.fillRect(pointer.x - 2, pointer.y - 2, 4, 4);
        }
        setTimeout(() => pointer.die(), 500);
        PLAYER.goto(x, y);
        GAME.canvas.focus();
    }

    $('#drone-launch').onclick = () => {
        const drone = new GEODrone(GAME, PLAYER);
        drone.x = PLAYER.x;
        drone.y = PLAYER.y;
    }

    for (let i = 0; i < 5; i++) {
        const radius = 1000;
        new GEOAsteroidField(GAME, Math.random() * radius * 2 - radius, Math.random() * radius * 2 - radius);
    }

    GAME.run();
}

start();
