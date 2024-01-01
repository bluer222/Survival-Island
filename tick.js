let gameXSize = 1000;
let gameYSize = 1000;
let everything = {
    "players":[],
    "items":[],
};
function drawPlayers(){
    everything.players.forEach((p) => p.draw());
}
function start(){
    //game setup
everything.players.push(new player(gameXSize, gameYSize));
tick();
}
function tick(){
    drawPlayers();
    //Object.keys(everything);
    window.requestAnimationFrame(tick);
}
start();