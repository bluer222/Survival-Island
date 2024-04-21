//fps counter
var times = [];
var fps;
//number of ticks per hour, used to run hourly things every tick instead(like hunger)
var ticksPerHour;
//number of ticks per second, used for secondly things(clock)
var ticksPerSecond; 
//multiply things that run 60 times a second by this to compensate for lower fps
var movementComp;
//list that will store all the plants in the world
var plants = [];
var gameSize = {
    //how many chunks in x and y
    x: 10,
    y: 10,
    //size of a chunk in px
    chunk: 1000,
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
//world seed for creating identical worlds
var gameSeed = 43523;
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
var grass = new backround("#C0F7B3");
var gameCamera = new camera();
var mainCharacter = new player({
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
});
//create array for chunks
var chunks = createArray(gameSize.x, gameSize.y);
//world creation
function start() {
    tick();
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
        mainCharacter.healing.hungerRate += mainCharacter.healing.sprintRate;
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
        mainCharacter.healing.hungerRate -= mainCharacter.healing.sprintRate;
    }
    //calculate the actual movement x and y if you compensate for diagnol
    processMovement();
});
function updateClock() {
    //one minute passes
    clock.minute += 1/ticksPerSecond;
    //if its an hour
    if (clock.minute >= 60) {
        clock.minute = 1;
        clock.hour += 1;
    }
    //if its a day
    if (clock.hour == 8) {
        clock.hour = 1;
        clock.day += 1;
        clock.isDay = 1;
    }
    //night
    if (clock.hour == 5) {
        clock.isDay = 0;
    }
    //season
    if (clock.day == 8) {
        if (clock.season == 4) {
            clock.day = 1;
            clock.season = 1;
            clock.year += 1;
            clock.seasonName = clock.seasonsNames[clock.season - 1];
            //year 
        } else {
            clock.day = 0;
            clock.season += 1;
            clock.seasonName = clock.seasonsNames[clock.season - 1];
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
function tempToColor(temperature) {
    // Calculate the color based on the temperature
    let r, g, b;

    if (temperature <= 40) {
        // If temperature is above 50, interpolate between green and yellow
        r = 0;
        g = Math.round(255 * (temperature - 30) / (40 - 30));
        b = 255;
    } else if (temperature < 60) {
        // If temperature is below or equal to 50, interpolate between blue and green
        r = Math.round(255 * (temperature - 40) / (60 - 40));
        g = 255;
        b = Math.round(255 * (temperature - 60) / (40 - 60));
    } else if (temperature >= 60) {
        // If temperature is above 50, interpolate between green and yellow
        r = 255;
        g = Math.round(255 * ((100 - temperature) / 40));
        b = 0;
    }
    return "rgb(" + r + ", " + g + ", " + b + ")"
}
//this function finds if a chunk is onscreen
/*it finds how far the center of the chunk is
from the camera, and how far it has to be for it to be offscreen,
using this it knows if it is onscreen*/
function drawchunks(){
    let start = performance.now();
    //number of loaded chunks
    let onscreenChunks = 0;
    //chunks is an array with arrays within it
    //to access a chunk you do chunks[x][y]
    //cycle through the rows
    chunks.forEach((row, y) => {
        //cycle through the chunks in a row
        row.forEach((currentChunk, x) => {
            //is it close enough?
             //create gameoffset, this compensates for the screensize, and the camera pos
            let gameXOffset = gameCamera.x - (screenW / 2);
            let gameYOffset = gameCamera.y - (screenH / 2);
            if(insideScreen(x*gameSize.chunk-gameXOffset, y*gameSize.chunk-gameYOffset, gameSize.chunk, gameSize.chunk)/*Math.abs(xpos-gameCamera.x) < xdistance && Math.abs(ypos-gameCamera.y) < ydistance*/){
                //if its undefined then generate it
                if(chunks[x][y] == ""){
                    console.log("creating chunk x:" +x+", y:" +y);
                    chunks[x][y] = new chunk({
                        startX: x*gameSize.chunk,
                        startY: y*gameSize.chunk,
                        endX: (x+1)*gameSize.chunk,
                        endY: (y+1)*gameSize.chunk,
                        color: "#C0F7B3",
                        seed: gameSeed*x*y,
                        treeNumber: 10
                    });
                }
                onscreenChunks += 1;
                //draw the chunk
                chunks[x][y].draw();
            }
        });
    });
    console.log("chunks took " + (performance.now()-start) + " ms");
    console.log(onscreenChunks + " loaded chunks");
}
function tick() {
    let start = performance.now();
    //fps
    const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
        times.shift();
    }
    times.push(now);
    fps = times.length;
    //set ticks per hour to frames per second times seocnds per game hour(60)
    ticksPerHour = 60 * fps;
        //set ticks per second to frames per second
        ticksPerSecond = 60 * fps;
    //if fps is lower multiply by a higher number
    movementComp = 60 / fps;
    updateClock();
        mainCharacter.move(movement.speed, movement.cx, movement.cy)
    gameCamera.move(cameraSpeed, mainCharacter.x, mainCharacter.y);
    mainCharacter.tickSurvival();
    grass.draw();
    //finds onscreen chunks, if not generated generate them, then render them
    drawchunks();
    //the other stuff
    mainCharacter.draw();
    bars.health.draw(mainCharacter.health, bars.hthColor);
    bars.hunger.draw(mainCharacter.hunger, bars.hngColor);
    bars.temp.draw(mainCharacter.temp, tempToColor(mainCharacter.temp));
    drawText(fps, screenW - 30, 20, 30);
    //Object.keys(everything);
    window.requestAnimationFrame(tick);
    console.log("tick took " + (performance.now()-start) + "ms");

}
start();