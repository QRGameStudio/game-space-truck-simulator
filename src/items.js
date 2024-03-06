/**
 * @typedef {{name: string, basePrice: number, color: string, dropRate: number}} Item
 */

/**
 *
 * @type {Item[]}
 */
const ITEMS_ARR = [{
    name: 'metal',
    basePrice: 1,
    color: 'gray',
    dropRate: 100
}, {
    name: "gold",
    basePrice: 10,
    color: "yellow",
    dropRate: 10
}, {
    name: "copper",
    basePrice: 2,
    color: "orange",
    dropRate: 60,
}, {
    name: "water",
    basePrice: 8,
    color: "blue",
    dropRate: 20,
}];


// Automatically create dictionary with items
/**
 *
 * @type {{[name: string]: Item}}
 */
const ITEMS = {};
ITEMS_ARR.forEach(x => ITEMS[x.name] = x);
