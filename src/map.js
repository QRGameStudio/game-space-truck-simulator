class SystemMap {
    constructor() {
        this.mapTypes = new Set([GEOPirate.t, GEOTrader.t, GEOMiner.t]);
        NAVIGABLE_TYPES.forEach(x => this.mapTypes.add(x));

        const btnMap = $('#btnMap');
        new GRenderer(btnMap).render();  // render icon

        btnMap.onclick = async () => {
            // noinspection JSUnusedGlobalSymbols
            const functions = {
                gotoObject: (point) => {
                    PLAYER.goto(point.x, point.y, 200);
                    functions.hideModal();
                }
            }

            let intervalRender = null;

            const backData = {};
            const modalClose = MODAL.show('targetSelection', await this.__getRendererData(), functions, backData);
            const rendered = await MODAL.fetchRendererFromBackData(backData);

            this.__scrollToPlayer();
            this.__resolveSystemOverlaps();
            intervalRender = setInterval(async () => {
                rendered.variables = await this.__getRendererData();
                rendered.render();
                this.__resolveSystemOverlaps();
            }, 2000);

            modalClose.then(() => clearInterval(intervalRender));
        }
    }

    __scrollToPlayer() {
        setTimeout(() => {
            const mapContainer = $('.system-map-container');

            // Scroll map to the player position
            const mapPlayer = $('.system-player');
            const containerRect = mapContainer.getBoundingClientRect();
            const playerRect = mapPlayer.getBoundingClientRect();
            const verticalOffset = playerRect.top - containerRect.top + mapContainer.scrollTop;
            const horizontalOffset = playerRect.left - containerRect.left + mapContainer.scrollLeft;
            const verticalScrollTo = verticalOffset - (mapContainer.clientHeight / 2) + (mapPlayer.clientHeight / 2);
            const horizontalScrollTo = horizontalOffset - (mapContainer.clientWidth / 2) + (mapPlayer.clientWidth / 2);
            mapContainer.scrollTop = verticalScrollTo;
            mapContainer.scrollLeft = horizontalScrollTo;
        });
    }

    __resolveSystemOverlaps() {
        function checkOverlap(element1, element2) {
            const rect1 = element1.getBoundingClientRect();
            const rect2 = element2.getBoundingClientRect();

            return !(rect1.right < rect2.left ||
                rect1.left > rect2.right ||
                rect1.bottom < rect2.top ||
                rect1.top > rect2.bottom);
        }

        function moveRight(element, referenceElement) {
            const referenceRect = referenceElement.getBoundingClientRect();
            const currentLeft = parseInt(window.getComputedStyle(element).left, 10);
            element.style.left = `${currentLeft + referenceRect.width + 10}px`; // Move right by the width of referenceElement + some margin
        }

        const children = document.querySelectorAll('.system-map > .system');
        let moved;

        do {
            moved = false;
            for (let i = 0; i < children.length; i++) {
                for (let j = i + 1; j < children.length; j++) {
                    if (checkOverlap(children[i], children[j])) {
                        moveRight(children[j], children[i]);
                        moved = true;
                    }
                }
            }
        } while (moved);
    }

    async __getRendererData() {
        const fields = (await GAME
            .getNearest(PLAYER, NAVIGABLE_TYPES));
        const minX = Math.min(...fields.map(x => x.x));
        const minY = Math.min(...fields.map(x => x.y));
        const maxX = Math.max(...fields.map(x => x.x));
        const maxY = Math.max(...fields.map(x => x.y));
        const mapPrecision = 10000;

        const mapFields = fields.map((obj) => {
            const distance = GAME.distanceBetween(PLAYER, obj); // meters
            return {
                x: obj.x,
                y: obj.y,
                map: {
                    x: Math.floor((obj.x - minX) / mapPrecision) + 100,
                    y: Math.floor((obj.y - minY) / mapPrecision) + 100,
                },
                isNavigable: NAVIGABLE_TYPES.has(obj.t),
                isPlayer: obj.t === PLAYER.t,
                name: obj?.name,
                distance: `${Math.round(distance) / 1000} km`,
                distanceFloor: `${Math.floor(distance / 1000)} km`,
                time: formatTime(Math.floor(distance / (PLAYER.maxSpeed * GAME.fps))),
                icon: obj?.icon
            }
        });

        return {
            fields: mapFields,
            map: {
                max: {
                    x: Math.floor((maxX - minX) / mapPrecision) + 200,
                    y: Math.floor((maxY - minY) / mapPrecision) + 200
                }
            }
        };
    }
}
