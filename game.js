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
 * @type {GScore}
 */
const SCORE = new GScore();

/**
 * @type {GModal}
 */
const MODAL = new GModal();

/**
 * @type {GStorage}
 */
const STORAGE = new GStorage("space-truck-simulator");


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

/**
 *
 * @template T
 * @param items {{item: T, weight: number}[]}
 * @param reversed {boolean}
 * @return T
 */
function weightedRandomChoice(items, reversed = false) {
    if (reversed) {
        const maxWeight = Math.max(...items.map(x => x.weight)) + 1;
        items = items.map((x) => ({...x, weight: maxWeight - x.weight}))
    }

    items.sort((a, b) => a.weight - b.weight);
    const weightSumMax = items.map((x) => x.weight).reduce((a, b) => a + b, 0);
    const randomWeight = weightSumMax * Math.random();

    let weightSum = 0;
    for (const item of items) {
        weightSum += item.weight;
        if (weightSum >= randomWeight) {
            return item.item;
        }
    }
}

async function saveGame() {
    /**
     * @param type {string}
     * @return {{[key: string]: any}[]}
     */
    function saveDictBulkForType(type) {
        const data = [];
        for (const obj of GAME.objectsOfTypes(new Set([type]))) {
            // noinspection JSUnresolvedReference
            data.push(obj.saveDict())
        }
        return data;
    }

    await STORAGE.set('save', {
        player: PLAYER.saveDict(),
        stations: saveDictBulkForType('space-station'),
        pirates: saveDictBulkForType('pirate'),
        asteroid: saveDictBulkForType(GEOAsteroid.t),
        fields: saveDictBulkForType(GEOAsteroidField.t),
        miners: saveDictBulkForType(GEOMiner.t),
        score: SCORE.get()
    });
}


async function loadGame() {
    const saveData = await STORAGE.get('save');
    if (!saveData) {
        return false;
    }
    PLAYER.loadDict(saveData.player);
    saveData.stations.map(x => new GEOStation(GAME, 0, 0).loadDict(x));
    saveData.pirates.map(x => new GEOPirate(GAME).loadDict(x));
    saveData.fields.map(x => new GEOAsteroidField(GAME, 0, 0, 0).loadDict(x));
    saveData.asteroid.map(x => new GEOAsteroid(GAME).loadDict(x));
    saveData.miners.map(x => new GEOMiner(GAME).loadDict(x));

    // noinspection JSValidateTypes
    /** @type {GEOAsteroidField[]} */
    const fields = [...GAME.objectsOfTypes(new Set([GEOAsteroidField.t]))];
    for (const obj of GAME.objectsOfTypes(new Set([GEOAsteroid.t]))) {
        // noinspection JSValidateTypes
        /** @type {GEOAsteroid} */
        const asteroid = obj;
        if (asteroid.fieldId !== null) {
            const field = fields.find(x => x.uuid === asteroid.fieldId);
            if (field) {
                field.asteroids.push(asteroid);
            }
        }
    }

    await SCORE.set(saveData.score);
    return true;
}


async function start() {
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
    GAME.hearingDistance = GAME.r * 4;

    const initialGameSaved = await loadGame();

    const radius = 10000000;
    const fields = 15;
    const stations = 5;

    (() => {
        const dustCount = 100;
        GAME.onStep = () => {
            if (GEODust.count < dustCount * Math.log2(Math.abs(PLAYER.s) + 1)) {
                new GEODust(GAME);
            }

            while (PLAYER.getNearests(GEOAsteroidField.t, radius * 2).length < fields) {
                new GEOAsteroidField(GAME, PLAYER.x + Math.random() * radius * 2 - radius, PLAYER.y + Math.random() * radius * 2 - radius);
            }

            const piratesCount = [...GAME.objectsOfTypes(new Set([GEOPirate.t]))].length;
            for (let i = 0; i < Math.max(Math.floor(radius / 100000), 1) - piratesCount; i++) {
                console.log('[GAME] Creating pirate')
                const pirate = new GEOPirate(GAME);
                pirate.x = Math.random() * radius * 2 - radius;
                pirate.y = Math.random() * radius * 2 - radius;
            }

            let minersCount = [...GAME.objectsOfTypes(new Set([GEOMiner.t]))].length;
            const stationsCount = [...GAME.objectsOfTypes(new Set([GEOStation.t]))].length;
            while (minersCount < stationsCount / 2 + 1) {
                console.log('[GAME] Creating miner')
                const miner = new GEOMiner(GAME);
                const randomStation = GEOStation.stations[Math.floor(GEOStation.stations.length * Math.random())];
                miner.x = randomStation.x;
                miner.y = randomStation.y;
                minersCount += 1;
            }
        };

        for (let i = 0; i < dustCount / 2; i++) {
            new GEODust(GAME, true);
        }
    })();

    if (!initialGameSaved) {
        for (let i = 0; i < stations; i++) {
            new GEOStation(GAME, Math.random() * radius * 2 - radius, Math.random() * radius * 2 - radius);
        }

        const randomStation = GEOStation.stations[Math.floor(GEOStation.stations.length * Math.random())];
        PLAYER.x = randomStation.x;
        PLAYER.y = randomStation.y;
    }

    GAME.onKeyDown = (key) => {
        switch (key) {
            case "t":
                const miner = new GEOMiner(GAME);
                miner.x = PLAYER.x;
                miner.y = PLAYER.y;
                break;
            case "f":
                new GEOAsteroidField(GAME, PLAYER.x, PLAYER.y);
                break;
            case " ":
                PLAYER.fireLasers();
                break;
            case "p":
                GAME.paused = true;
                MODAL.alert('This game is paused', 'PAUSE').then(() => GAME.paused = false);
                break;
            case "o":
                GAME.paused = true;
                saveGame()
                    .then(() => MODAL.alert('The game was saved', 'SAVED'))
                    .then(() => location.reload());
                break;
            case "r":
                GAME.paused = true;
                MODAL.yesNo('Do you really want to reset the save game?', "DELETE SAVE")
                    .then((response) => {
                        if (!response) {
                            GAME.paused = false;
                            return;
                        }
                        STORAGE.del('save');
                        location.reload();
                    });
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


    const btnMap = $('#btnMap');
    new GRenderer(btnMap).render();  // render icon
    btnMap.onclick = () => {
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

        // noinspection JSUnusedGlobalSymbols
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

    setInterval(() => saveGame(), 10000);
    initMusic();
    GAME.run();
}

(async () => await start())();
