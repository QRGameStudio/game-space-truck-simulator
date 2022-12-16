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

/**
 *
 * @type {GModal}
 */
const MODAL = new GModal();


const NAVIGABLE_TYPES = new Set([GEOStation.t, GEOAsteroidField.t]);

/** @type {GEG} */
let GAME;

function initMusic() {
    MUSIC.cache['laser'] = [[["C8"],50],[["D7"],50]];
    MUSIC.cache['humm0'] =  [[["C1"],50],[["D1"],50]];
    MUSIC.cache['humm1'] =  [[["C2"],50],[["D2"],50]];
    MUSIC.cache['humm2'] =  [[["C3"],50],[["D3"],50]];
    MUSIC.cache['alert'] = [[["C2"],500],[["C4"],500],[["C2"],500],[["C4"],500],[["silence"],250],[["C2"],500],[["C4"],500],[["C2"],500],[["C4"],500],[["silence"],250],[[],500]];
    MUSIC.cache['boom'] = [[["C1"],100],[["C2"],100],[["C1"],100],[[],500]];
    MUSIC.cache['cargoFull'] = [[["A3"],200],[["B3"],200],[["C4"],200],[["D4"],500],[[],500]];
}

function randomName(lengthMin, lengthMax) {
    const chars = lengthMin + Math.floor(Math.random() * (lengthMax - lengthMin));
    let name = '';

    const charlist = ['mnvcxlkjhgfdspztrwq', 'euioa'];
    for (let i = 0; i < chars; i++) {
        const list = charlist[i % 2];
        let char = list[Math.floor(Math.random() * list.length)];
        if (i === 0) {
            char = char.toUpperCase();
        }
        name += char;
    }

    return name;
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

    const radius = 100000;
    const fields = 15;
    const stations = 5;

    (() => {
        const dustCount = 100;
        GAME.onStep = () => {
            if (GEODust.count < dustCount * Math.log2(Math.abs(PLAYER.s) + 1)) {
                new GEODust(GAME);
            }

            while (GEOAsteroidField.fields.length < fields) {
                new GEOAsteroidField(GAME, Math.random() * radius * 2 - radius, Math.random() * radius * 2 - radius);
            }
        };

        for (let i = 0; i < dustCount / 2; i++) {
            new GEODust(GAME, true);
        }

        for (let i = 0; i < stations; i++) {
            new GEOStation(GAME, Math.random() * radius * 2 - radius, Math.random() * radius * 2 - radius);
        }
        const randomStation = GEOStation.stations[Math.floor(GEOStation.stations.length * Math.random())];
        PLAYER.x = randomStation.x;
        PLAYER.y = randomStation.y;
    })();

    GAME.onKeyDown = (key) => {
        switch (key) {
            case " ":
                PLAYER.fireLasers();
                break;
            case "p":
                GAME.paused = true;
                MODAL.alert('This game is paused', 'PAUSE').then(() => GAME.paused = false);
                break;
            case "-":
                GAME.zoom /= 1.1;
                break;
            case "+":
                GAME.zoom *= 1.1;
                break;
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

    // noinspection JSUnusedGlobalSymbols
    $('#btnMap').onclick = () => {

        const fields = GAME
            .getNearest(PLAYER, NAVIGABLE_TYPES)
            .map((obj) => {
                const distance = GAME.distanceBetween(PLAYER, obj); // meters
                return {
                    x: obj.x,
                    y: obj.y,
                    name: obj?.name,
                    distance: `${Math.round(distance) / 1000} km`,
                    icon: obj?.icon
                }
            });

        const functions = {
            gotoObject: (point) => {
                PLAYER.goto(point.x, point.y, 200);
                functions.hideModal();
            }
        }

        MODAL.show('targetSelection', {
            fields
        }, functions)
    }

    for (let i = 0; i < Math.max(Math.floor(radius / 10000), 1); i++) {
        const pirate = new GEOPirate(GAME);
        pirate.x = Math.random() * radius * 2 - radius;
        pirate.y = Math.random() * radius * 2 - radius;
    }

    initMusic();
    GAME.run();
}

start();
