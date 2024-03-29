//the size of the map width(x) and height(y)
var gameSize = {
    x: 10000,
    y: 10000
};
var healing = {
    //ammount hunger and temp go down each hour by default(can be changed by spriting or whatever)
    hungerRate: 10,
    tempRate: 10,
    //how much extra your hunger goes down when sprinting
    sprintRate: 10,
    //healing will be fastest with hunger and temp at these values
    bestHunger: 100,
    bestTemp: 50,
    //increasing this reduces the area where your close enough to optimal for you to heal
    //it also makes you lose health faster    
    healDifficulty: 7,
    //how quickly your health goes up or down
    healRate: 20
};
//global movement attributes
var movement = {
    //these are direct key inputs x = 1 if w pressed, -1 if s pressed
    x: 0,
    y: 0,
    //to stop diagnol faster we can calculate what percent of the x and y speed we should go at to be the same overall speeed
    //these are compensated x and compensated y
    cx: 0,
    cy: 0,
    //current speed
    speed: 5,
    //sprint and non sprint speeds
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
//original world seed for creating identical worlds
var ogSeed = 1234;
//seed used for random(changed every time)
var gameSeed = 1234;
//clock, self explanitory
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
var bars = {
    //inputs are x, y, width, height
    hunger: new bar(5, 40, 300, 30),
    health: new bar(5, 5, 300, 30),
    temp: new bar(5, 75, 300, 30),
    //bar colors
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
    //if you press shift and werent already running
    if (e.key == "Shift" && movement.speed != movement.sprintSpeed) {
        //set speed to sprintspeed and increase hunger rate based on config
        movement.speed = movement.sprintSpeed;
        mainCharacter.healing.hungerRate += healing.sprintRate;
    }
    //calculate the actual movement x and y if you compensate for diagnol
    processMovement();
});
//detect keyup events
document.addEventListener('keyup', (e) => {
    //if you released a movement key then set the value back down 
    if (e.key == "w" || e.key == "W" || e.key == "ArrowUp") { 
        movement.y += 1;
    }
    if (e.key == "d" || e.key == "D" || e.key == "ArrowRight") { 
        movement.x -= 1;
    }
    if (e.key == "s" || e.key == "S" || e.key == "ArrowDown") { 
        movement.y -= 1;
    }
    if (e.key == "a" || e.key == "A" || e.key == "ArrowLeft") { 
        movement.x += 1;
    }
    //if you release shift and you were sprinting before
    if (e.key == "Shift" && movement.speed == movement.sprintSpeed) {
        //set the speed to default and reduce hungerrate to normal
        movement.speed = movement.defaultSpeed;
        mainCharacter.healing.hungerRate -= healing.sprintRate;
    }
    //calculate the actual movement x and y if you compensate for diagnol
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
        //if your not moving then dont move
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
    mainCharacter = new player(healing);
    grass = new backround("#C0F7B3");

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
function tempToColor(temperature) {
    // Calculate the color based on the temperature
    let r, g, b;

    if (temperature <= 40) {
         // If temperature is above 50, interpolate between green and yellow
        r = 0;
        g = Math.round(255 * (temperature-30)/(40-30));
        b = 255;
    }else if(temperature < 60){
        // If temperature is below or equal to 50, interpolate between blue and green
        r = Math.round(255 * (temperature-40)/(60-40));
        g = 255;
        b = Math.round(255 * (temperature-60)/(40-60));
    } else if(temperature >= 60){
        // If temperature is above 50, interpolate between green and yellow
        r = 255;
        g = Math.round(255 * ((100 - temperature) / 40));
        b = 0;
    }
    return "rgb(" + r + ", " + g + ", " + b + ")" 
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