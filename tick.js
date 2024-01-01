let everything = {
    "players":[],
    "items":[],
};
function drawPlayers(){
    everything.players.forEach((p) => p.draw());
}
function start(){
    //game setup
everything.players.push(new player);
tick();
}
function tick(){
    drawPlayers();
    //Object.keys(everything);
    window.requestAnimationFrame(tick);
}
start();