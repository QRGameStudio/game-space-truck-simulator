function gameEntryPoint() {
    console.debug('[LOADER] Starting game');
    // !G.import('game.js')
}

window.addEventListener('load', gameEntryPoint);
if (window.qrgames.env) {
    window.qrgames.onload = gameEntryPoint;
}
