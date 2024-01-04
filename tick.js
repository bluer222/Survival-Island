//size of the map
let gameXSize = 1000,
    gameYSize = 1000;
//current movement and speed
var movement = {
    x: 0, 
    y: 0,
    speed: 10
};
//how quickly does the camera go to the player pos in frames(less frames is faster)
var cameraSpeed = 10;
//lists that will store all the objects in the world
var players = [];
var items = [];
//variables to store things like the camera
var mainCharacter;
var gameCamera;
var grass;
var temptree;
//detect keydown
document.addEventListener('keydown', (e) => {
    //if it is a movement key then set the movement variale to reflect it
    if (e.key == "w" || e.key == "W" || e.key == "ArrowUp") { 
        movement.y -= 1; 
    }
    if (e.key == "d" || e.key == "D" || e.key == "ArrowRight") {
        movement.x += 1; 
    }
    if (e.key == "s" || e.key == "S" || e.key == "ArrowDown") { 
        movement.y += 1;
    }
    if (e.key == "a" || e.key == "A" || e.key == "ArrowLeft") {
        movement.x -= 1; 
    }
    //limit movement variables to a max of 1(if a key is held it will triger keydown multiple times)
    movement.y = clamp(movement.y, -1, 1);
    movement.x = clamp(movement.x, -1, 1);
    //this compensates for diagnols being faster
    const distance = Math.sqrt(movementx * movementx + movementy * movementy);
    movement.x = movement.x / distance;
    movement.y = movement.y / distance;
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