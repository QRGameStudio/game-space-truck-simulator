const { random, sin, cos, PI } = Math;
const $ = document.querySelector.bind(document);

/** @type {GEOPlayer} */
let player;

// !G.import('src/index.js')

/**
 * @type {GSongLib}
 */
const MUSIC = new GSongLib();

/** @type {GRenderer} */
let inventoryRenderer;

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
    GAME.paused = true;
    GAME.objects.length = 0;
    GAME.paused = false;

    player = new GEOPlayer(GAME);
    GAME.cameraFollowObject = player;
    inventoryRenderer = new GRenderer($('.inventory'), {player});

    new GEOStation(GAME, 0, 0);

    for (let i = 0; i < 10; i++) {
        createAsteroid(GAME);
    }

    function autoSpawnAsteroids() {
        createAsteroid(GAME);
        setTimeout(() => autoSpawnAsteroids(), 2500 + (15000 * random()));
    }
    autoSpawnAsteroids();

    GAME.onStep = () => {
        if (GEODust.count < 100 * Math.log2(Math.abs(player.s) + 1)) {
            new GEODust(GAME);
        }
    };

    for (let i = 0; i < 50; i++) {
        new GEODust(GAME, true);
    }

    GAME.onKeyDown = (key) => {
        if (key === " ") {
            player.fireLasers();
        }
    }
    GAME.onClick = (x, y) => {
        const pointer = GAME.createObject(x, y);
        pointer.draw = (ctx) => {
            ctx.fillStyle = 'pink';
            ctx.fillRect(pointer.x - 2, pointer.y - 2, 4, 4);
        }
        setTimeout(() => pointer.die(), 500);
        player.goto(x, y);
        GAME.canvas.focus();
    }

    for (let i = 0; i < 5; i++) {
        new GEOAsteroidField(GAME, Math.random() * 1000000, Math.random() * 1000000);
    }

    GAME.run();
}

start();
