let gameXSize = 1000,
    gameYSize = 1000;
var movement = {
    x: 0, 
    y: 0,
    speed: 10
};
var cameraSpeed = 10;
let everything = {
    "players":[],
    "items":[],
};
var mainCharacter;
var gameCamera;
var grass;
var temptree;
document.addEventListener('keydown', (e) => {
    if (e.key == "w" || e.key == "W" || e.key == "ArrowUp") { //if the keys w or up are down
        movement.y -= 1; //the code recognizes that you are holding up or w which moves you in a different function
    }
    if (e.key == "d" || e.key == "D" || e.key == "ArrowRight") { //if the keys d or right are down
        movement.x += 1; //the code recognizes that you are holding right or d which moves you in a different function
    }
    if (e.key == "s" || e.key == "S" || e.key == "ArrowDown") { //if the keys s or down are down
        movement.y += 1; //the code recognizes that you are holding down or s which moves you in a different function
    }
    if (e.key == "a" || e.key == "A" || e.key == "ArrowLeft") { //if the keys a or left are down
        movement.x -= 1; //the code recognizes that you are holding left or a which moves you in a different function
    }
    movement.y = clamp(movement.y, -1, 1);
    movement.x = clamp(movement.x, -1, 1);
});
document.addEventListener('keyup', (e) => {
    if (e.key == "w" || e.key == "W" || e.key == "ArrowUp") { //if the keys w or up are down
        movement.y += 1; //the code recognizes that you are holding up or w which moves you in a different function
    }
    if (e.key == "d" || e.key == "D" || e.key == "ArrowRight") { //if the keys d or right are down
        movement.x -= 1; //the code recognizes that you are holding right or d which moves you in a different function
    }
    if (e.key == "s" || e.key == "S" || e.key == "ArrowDown") { //if the keys s or down are down
        movement.y -= 1; //the code recognizes that you are holding down or s which moves you in a different function
    }
    if (e.key == "a" || e.key == "A" || e.key == "ArrowLeft") { //if the keys a or left are down
        movement.x += 1; //the code recognizes that you are holding left or a which moves you in a different function
    }
});
function start(){
    //game setup
    gameCamera = new camera();
    mainCharacter = new player();
    grass = new backround("#C0F7B3");
    temptree = new tree(gameXSize/2, gameXSize/2);
    tick();
}
function tick(){
    mainCharacter.move(movement.speed, movement.x, movement.y)
    gameCamera.move(cameraSpeed, mainCharacter.x, mainCharacter.y);
    grass.draw();
    mainCharacter.draw();
    temptree.draw();
        //Object.keys(everything);
    window.requestAnimationFrame(tick);
}
start();