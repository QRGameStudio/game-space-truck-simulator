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

function initMusic() {
    MUSIC.cache['laser'] = [[["C8"],50],[["D7"],50]];
    MUSIC.cache['humm0'] =  [[["C1"],50],[["D1"],50]];
    MUSIC.cache['humm1'] =  [[["C2"],50],[["D2"],50]];
    MUSIC.cache['humm2'] =  [[["C3"],50],[["D3"],50]];
    MUSIC.cache['alert'] = [[["C2"],500],[["C4"],500],[["C2"],500],[["C4"],500],[["silence"],250],[["C2"],500],[["C4"],500],[["C2"],500],[["C4"],500],[["silence"],250],[[],500]];
    MUSIC.cache['boom'] = [[["C1"],100],[["C2"],100],[["C1"],100],[[],500]];
}

function start() {
    // noinspection JSValidateTypes
    /**
     * @type {HTMLCanvasElement}
     */
    const canvas = $('#game-canvas');
    GAME = new GEG(canvas);

    GAME.res = GUt.isLandscape() ? {w: 1920, h: 1080} : {w: 1080, h: 1920};
    // GAME.zoom = 2/3;

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

    const radius = 100000;
    const fields = 5;
    for (let i = 0; i < fields; i++) {
        new GEOAsteroidField(GAME, Math.random() * radius * 2 - radius, Math.random() * radius * 2 - radius);
    }

    for (let i = 0; i < Math.max(Math.floor(fields / 10), 1); i++) {
        const pirate = new GEOPirate(GAME);
        pirate.x = Math.random() * radius * 2 - radius;
        pirate.y = Math.random() * radius * 2 - radius;
    }

    initMusic();
    GAME.run();
}

start();
