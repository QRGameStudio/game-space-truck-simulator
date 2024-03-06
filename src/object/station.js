class GEOStation extends GEOSavable {
    /**
     *
     * @type {(GPoint & {name: string})[]}
     */
    static stations = [];

    static t = 'space-station';

    static icon = GUt.ud('8J+PsA==');

    /**
     *
     * @param game {GEG}
     * @param x {number} x-position
     * @param y {number} y-position
     */
    constructor(game, x, y) {
        super(game);
        this.x = x;
        this.y = y;
        this.t = GEOStation.t;
        this.w = this.h = 120;
        this.clickable = true;
        this.__spin_speed = 1;
        this.icon = GEOStation.icon;
        this.name = randomName(5, 10) + ' station';
        this.label = new GEOLabel(game, this, this.name);
        this.inventory = new Inventory(10000);
        this.inventory.add('metal', 300 + Math.floor(Math.random() * this.inventory.size));
        this.inventory.onchange = (item, count) => {
            if (this.__modal_renderer) {
                this.__modal_renderer.render();
            }
        }

        /**
         * @type {GRenderer|null}
         * @private
         */
        this.__modal_renderer = null;

        GEOStation.stations.push({x: this.x, y: this.y, name: this.name});
    }

    onclick(x, y, clickedObject) {
        if (this.distanceFrom(PLAYER) > this.r  + 300) {
            return false;
        }

        console.debug("[STS] Welcome to", this.name);

        const backData = {};
        MODAL.show('station', {
            station: this,
            player: PLAYER
        }, {
            /**
             * @param item {string}
             * @param count {number | null}
             */
            buy: (item, count) => {
                if (count === null) {
                    count = Math.min(PLAYER.inventory.free, this.inventory.get(item));
                }

                const sellingPrice = this.sellingPrice(item);
                let price = sellingPrice * count;
                if (price > SCORE.get()) {
                    return;
                }
                count = GEOStation.transferCargo(this, PLAYER, item, count);
                SCORE.inc(-1 * count * sellingPrice);
                this.__modal_renderer?.render();
            },
            /**
             * @param item {string}
             * @param count {number | null}
             */
            sell: (item, count) => {
                if (count === null) {
                    count = Math.min(this.inventory.free, PLAYER.inventory.get(item));
                }

                const price = this.buyingPrice(item);
                count = GEOStation.transferCargo(PLAYER, this, item, count);
                SCORE.inc(count * price);
                this.__modal_renderer?.render();
            }
        }, backData).then(() => this.__modal_renderer = null);
        MODAL.fetchRendererFromBackData(backData).then((renderer) => this.__modal_renderer = renderer);

        return true;
    }

    /**
     *
     * @param item {string}
     * @return {number}
     */
    itemPrice(item) {
        let basePrice;

        switch (item){
            case "metal":
                basePrice = 1;
                break;
            default:
                throw new Error(`Unknown base price for ${item}`);
        }

        let price = basePrice;
        let field = this.getNearest(GEOAsteroidField.t);

        if (field === null) {
            price = (price + 1) ** 2;
        } else {
            price += basePrice * this.distanceFrom(field) / (4 * 500 * 1000);  // 500km ~ 1min of travel with basic ship
        }

        return price;
    }

    /**
     *
     * @param item {string}
     * @return {number}
     */
    buyingPrice(item) {
        if (this.inventory.full) {
            return 0;
        }

        let price = this.itemPrice(item);
        price *= 1 - (this.inventory.get(item) / this.inventory.size);
        price = Math.round(price * 100) / 100;
        return price;
    }

    /**
     *
     * @param item {string}
     * @return {number}
     */
    sellingPrice(item) {
        if (this.inventory.get(item) === 0) {
            return 0;
        }

        let price = this.buyingPrice(item) * 1.3;
        price = Math.round(price * 100) / 100;
        return price;
    }

    step() {
        super.step();
        this.ia += this.__spin_speed;
    }

    draw(ctx) {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 7;
        ctx.strokeRect(this.x - this.wh, this.y - this.hh, this.w, this.h);
    }

    saveDict() {
        return {
            ...super.saveDict(),
            name: this.name,
            inventory: this.inventory.stringify()
        };
    }

    loadDict(data) {
        this.name = this.label.text = data.name;
        this.inventory.parse(data.inventory);
        super.loadDict(data);
    }

    /**
     * @param from {GEOShip|GEOStation}
     * @param to {GEOShip|GEOStation}
     * @param type {string | null}
     * @param volume {number | null}
     * @return {number}
     */
    static transferCargo(from, to, type = null, volume  = null) {
        if (type === null) {
            const cargoTypes = from.inventory.keys();
            if (!cargoTypes.length || to.inventory.full) {
                return 0;
            }
            type = cargoTypes[Math.floor(cargoTypes.length * Math.random())];
        }

        const cargoStock = from.inventory.get(type);
        if (volume === null) {
            volume = Math.floor((Math.random() *  Math.min(to.inventory.free, cargoStock)) + 1);
        }

        volume = Math.min(to.inventory.free, volume, cargoStock);
        to.inventory.add(type, volume);
        from.inventory.remove(type, volume);

        return volume;
    }
}
