// !G.import('src/player.js')
// !G.import('src/asteroid.js')
// !G.import('src/station.js')

const { random, sin, cos, PI } = Math;
const $ = document.querySelector.bind(document);

/**
 * @type {GSongLib}
 */
let music;

/** @type {GRenderer} */
let inventoryRenderer;

/** @type {GEO} */
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

    music = new GSongLib();

    GAME.res = GUt.isLandscape() ? {w: 1920, h: 1080} : {w: 1080, h: 1920};
    GAME.paused = true;
    GAME.objects.length = 0;
    GAME.paused = false;

    player = createPlayer(GAME);
    GAME.cameraFollowObject = player;
    inventoryRenderer = new GRenderer($('.inventory'), {player});

    const station = new GEOStation(GAME);
    station.x = player.x - 1.5 * station.w;
    station.y = player.y;

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
            createLaser(GAME, player, true);
            createLaser(GAME, player, false);
        }
    }

    GAME.run();
}

start();
