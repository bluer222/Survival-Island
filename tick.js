let gameXSize = 1000,
    gameYSize = 1000;
var camera = {
    x: 0,
    y: 0
}
var movement = {
    x: 0, 
    y: 0,
    speed: 10
};
var speed = 10;
let everything = {
    "players":[],
    "items":[],
};
var mainCharacter;
function start(){
    document.addEventListener('keydown', (e) => {
        if (e.key == "w" || e.key == "W" || e.key == "ArrowUp") { //if the keys w or up are down
            movement.y += 1; //the code recognizes that you are holding up or w which moves you in a different function
        }
        if (e.key == "d" || e.key == "D" || e.key == "ArrowRight") { //if the keys d or right are down
            movement.x += 1; //the code recognizes that you are holding right or d which moves you in a different function
        }
        if (e.key == "s" || e.key == "ArrowDown") { //if the keys s or down are down
            movement.y -= 1; //the code recognizes that you are holding down or s which moves you in a different function
        }
        if (e.key == "a" || e.key == "ArrowLeft") { //if the keys a or left are down
            movement.x -= 1; //the code recognizes that you are holding left or a which moves you in a different function
        }
        movement.y = clamp(movement.y, -1, 1);
        movement.x = clamp(movement.x, -1, 1);

    });
    document.addEventListener('keyup', (e) => {
        if (e.key == "w" || e.key == "W" || e.key == "ArrowUp") { //if the keys w or up are down
            movement.y = 0; //the code recognizes that you are holding up or w which moves you in a different function
        }
        if (e.key == "d" || e.key == "D" || e.key == "ArrowRight") { //if the keys d or right are down
            movement.x = 0; //the code recognizes that you are holding right or d which moves you in a different function
        }
        if (e.key == "s" || e.key == "ArrowDown") { //if the keys s or down are down
            movement.y = 0; //the code recognizes that you are holding down or s which moves you in a different function
        }
        if (e.key == "a" || e.key == "ArrowLeft") { //if the keys a or left are down
            movement.x = 0; //the code recognizes that you are holding left or a which moves you in a different function
        }
    });
    //game setup
    mainCharacter = new player();
tick();
}
function moveCamera(movementSpeed){
    const distance = Math.sqrt(movement.x * movement.x + movement.y * movement.y);
    console.log(distance);
    const scaledXMovement = movement.x / distance;
    const scaledYMovement = movement.y / distance;
    camera.x += scaledXMovement * movementSpeed; // Apply movement with adjusted speed
    camera.y += scaledYMovement * movementSpeed;
}
function tick(){
    moveCamera(movement.speed);
    mainCharacter.draw();
        //Object.keys(everything);
    //window.requestAnimationFrame(tick);
}
start();