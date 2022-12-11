/** !G.import('src/player.js') */
/** !G.import('src/asteroid.js') */

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
