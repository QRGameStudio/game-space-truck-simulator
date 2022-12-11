// !G.import('src/index.js')

const { random, sin, cos, PI } = Math;
const $ = document.querySelector.bind(document);

/**
 * @type {GSongLib}
 */
const MUSIC = new GSongLib();

/** @type {GRenderer} */
let inventoryRenderer;

/** @type {GEOPlayer} */
let player;

/** @type {GEG} */
let GAME;


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

    let station = new GEOStation(GAME);
    station.x = 0;
    station.y = 0;

    station = new GEOStation(GAME);
    station.x = -300;
    station.y = -300;

    station = new GEOStation(GAME);
    station.x = 300;
    station.y = 300;

    $('#fR').ontouchstart = () => createLaser(GAME, player, false);
    $('#fL').ontouchstart = () => createLaser(GAME, player, true);
    const bR = $('#bR');
    const bL = $('#bL');
    bR.ontouchstart = () => GAME.press('d');
    bR.ontouchend = () => GAME.release('d');
    bL.ontouchstart = () => GAME.press('a');
    bL.ontouchend = () => GAME.release('a');

    for (let i = 0; i < 10; i++) {
        createAsteroid(GAME);
    }

    function autoSpawnAsteroids() {
        createAsteroid(GAME);
        setTimeout(() => autoSpawnAsteroids(), 2500 + (15000 * random()));
    }
    autoSpawnAsteroids();

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
    }

    GAME.run();
}

start();
