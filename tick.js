var gameSize = {
    x: 10000,
    y: 10000
};
//current movement and speed
var movement = {
    x: 0,
    y: 0,//cx and cy are compensated for diagnol movement
    cx: 0,
    cy: 0,
    speed: 5,
    defaultSpeed: 5,
    sprintSpeed: 7
};
//how quickly does the camera go to the player pos in frames(less frames is faster)
var cameraSpeed = 15;
//list that will store all the plants in the world
var plants = [];
//variables to store things like the camera
var mainCharacter;
var gameCamera;
var grass;
var temptree;
var ogSeed = 1234;
var gameSeed = 1234;
var clock = {
    minute: 1,
    hour: 1,
    day: 1,
    year: 1,
    season: 1,
    seasonName: "spring",
    isDay: 1,
    seasonsNames: ["spring", "summer", "fall", "winter"]
}
var defaultHungerRate = 10;
var defaultTempRate = 50;
var bars = {
    hunger: "",
    health: "",
    temp: "",
    hngColor: "brown",
    hthColor: "red",
    tmpColor: "look at the temptocolor function"
}
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
    if (e.key == "Shift" && movement.speed != movement.sprintSpeed) {
        movement.speed = movement.sprintSpeed;
        mainCharacter.hungerRate += 10;
    }
    processMovement();
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
    if (e.key == "Shift" && movement.speed == movement.sprintSpeed) {
        movement.speed = movement.defaultSpeed;
        mainCharacter.hungerRate -= 10;
    }
    processMovement();
});
function updateClock(){
    //one minute passes
    clock.minute += 1;
    //if its an hour
    if(clock.minute == 60){
        clock.minute = 1;
        clock.hour += 1;
    }
    //if its a day
    if(clock.hour == 8){
        clock.hour = 1;
        clock.day += 1;
        clock.isDay = 1;
    }
    //night
    if(clock.hour == 5){
        clock.isDay = 0;
    }
    //season
    if(clock.day == 8){
        if(clock.season == 4){
        clock.day = 1;
        clock.season = 1;
        clock.year += 1;
        clock.seasonName = clock.seasonsNames[clock.season-1];
        //year 
        }else{
            clock.day = 0;
            clock.season += 1;
            clock.seasonName = clock.seasonsNames[clock.season-1];
        }
    }
}
function processMovement() {
    //limit movement variables to a max of 1(if a key is held it will triger keydown multiple times)
    movement.y = clamp(movement.y, -1, 1);
    movement.x = clamp(movement.x, -1, 1);
    //this compensates for diagnols being faster
    const distance = Math.sqrt(movement.x * movement.x + movement.y * movement.y);
    if (distance == 0) {
        movement.cx = 0;
        movement.cy = 0;
    } else {
        movement.cx = movement.x / distance;
        movement.cy = movement.y / distance;
    }
}
function start() {
    //game setup
    gameCamera = new camera();
    mainCharacter = new player(defaultHungerRate, defaultTempRate);
    grass = new backround("#C0F7B3");
    bars.hunger = new bar(5, 40, 300, 30)
    bars.health = new bar(5, 5, 300, 30)
    bars.temp = new bar(5, 75, 300, 30)

    for(let i = 0; i < 100; i++){
        plants.push(new tree(random(0, gameSize.x), random(0, gameSize.x)))
    }
        //start the clock
        setInterval(()=>{
            updateClock();
            //other time based stuff
        }, 1000)
    tick();
}
function tempToColor(temp){
    var b = 228 - (temp*1.28)
    var r = 100 + (temp*1.28)
    return "rgb(" + r + ", 128, " + b + ")" 
    
}
function tick() {
    mainCharacter.move(movement.speed, movement.cx, movement.cy)
    gameCamera.move(cameraSpeed, mainCharacter.x, mainCharacter.y);
    mainCharacter.tickSurvival();
    grass.draw();
    mainCharacter.draw();
    bars.health.draw(mainCharacter.health, bars.hthColor);
    bars.hunger.draw(mainCharacter.hunger, bars.hngColor);
    bars.temp.draw(mainCharacter.temp, tempToColor(mainCharacter.temp));
    //draw every plant
    plants.forEach((plant) => plant.draw());
    //Object.keys(everything);
    window.requestAnimationFrame(tick);
}
start();