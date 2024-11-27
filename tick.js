//tps counter
var times = 0;
var tps = 60;
//onscreen chunks
var onscreenChunks = [];
//number of ticks per hour, used to run hourly things every tick instead(like hunger)
var ticksPerHour;
//number of ticks per second, used for secondly things(clock)
var ticksPerSecond;
//multiply things that run 60 times a second by this to compensate for lower tps
var movementComp;
//list that will store all the plants in the world
var plants = [];
//things in touching distance
var touchableThings = [];
//the thing that will be interacted with if you press q
var interactObject = "";
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
//game configuration
var conf = {
    treesPerChunk: 10,
    bushesPerChunk: 3,
    //1 means every chunk has a wolf, 10 means 1 in 10 chunks have wolf
    chanceOfWolf: 1,
    //far wolves travel in one tick
    //because of how its coded wolves usually move faster than this
    wolfSpeed: movement.defaultSpeed-1,
    //how far animals like wolves can see you from
    animalSight: 150,
    //how far animals like wolves can damage you from
    animalRange: 75,
    //how much damage animals like wolves can do per second
    animalPower: 5,
    //every time a plant grows it decides when next to grow
    //in a number of ticks between these two nummbers
    //the plant will grow
    maxGrowSpeed: 500,
    minGrowSpeed: 1000,
    //when a berry plant is created its randomized between these how many berries it can hold
    maxBerries: 6,
    minBerries: 3,
}
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
    bestTemp: 60,
    //increasing this reduces the area where your close enough to optimal for you to heal
    //it also makes you lose health faster    
    healDifficulty: 7,
    //how quickly your health goes up or down
    healRate: 20,
});
var reachDistance = 75;
var hotbar = new inventory();
//create array for chunks
var chunks = createArray(gameSize.x, gameSize.y);
//world creation
function start() {
    tick();
}
//detect keydown
document.addEventListener('keydown', (e) => {
    //if it is a movement key then set the movement variale to reflect it
    //only count if this is a new press and not an old press repeating from being held
    if (e.repeat === false) {
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
        if (e.key == "1") { hotbar.selectedSlot = 0; }
        if (e.key == "2") { hotbar.selectedSlot = 1; }
        if (e.key == "3") { hotbar.selectedSlot = 2; }
        if (e.key == "4") { hotbar.selectedSlot = 3; }
        if (e.key == "5") { hotbar.selectedSlot = 4; }
        if (e.key == "6") { hotbar.selectedSlot = 5; }
        if (e.key == "7") { hotbar.selectedSlot = 6; }
        if (e.key == "8") { hotbar.selectedSlot = 7; }
        if (e.key == "9") { hotbar.selectedSlot = 8; }
        if (e.key == "0") { hotbar.selectedSlot = 9; }
        if (e.key == "e") {
            hotbar.use()
        }
        if (e.key == "q") {
            if (interactObject !== "") {
                interactObject.interact();
                console.log("there were " + touchableThings.length + " other things that could be interacted")
            }
        }

        //if you press shift and werent already running
        if (e.key == "Shift" && movement.speed != movement.sprintSpeed) {
            //set speed to sprintspeed and increase hunger rate based on config
            movement.speed = movement.sprintSpeed;
            mainCharacter.healing.hungerRate += mainCharacter.healing.sprintRate;
        }
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
    if (e.key == "e") {
        useHeld = false;
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
    //one minute passes every second
    clock.minute += 1 / ticksPerSecond;
    //one our passes every minute(60 game minutes)
    if (clock.minute >= 60) {
        clock.minute = 1;
        clock.hour += 1;
    }
    //day is 8 hours. after hour 5 it becomes night
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
    // blue = lch(60.6% 48.1 212.85)
    //red = lch(60.6% 71.69 44.48);
    //slowel adjust the numbers twards eachother
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
function generateChunk(x, y){
    console.log("creating chunk x:" +x+", y:" +y);
    chunks[x][y] = new chunk({
        x: x,
        y: y,
        startX: x * gameSize.chunk,
        startY: y * gameSize.chunk,
        endX: (x + 1) * gameSize.chunk,
        endY: (y + 1) * gameSize.chunk,
        color: "#C0F7B3",
        seed: gameSeed * x * y,
        treeNumber: conf.treesPerChunk,
        bushNumber: conf.bushesPerChunk,
        chanceOfWolf: conf.chanceOfWolf
    });
}
//this function finds if a chunk is onscreen
/*it finds how far the center of the chunk is
from the camera, and how far it has to be for it to be offscreen,
using this it knows if it is onscreen*/
function findChunks() {
    //because trees stick over the edge of chunks(and will be seen disappearling)
    //we pretend the screen is bigger than it is
    //this is how many pixles biggler
    let offset = 100;
    //loaded chunks
    onscreenChunks = [];
    //chunks is an array with arrays within it
    //to access a chunk you do chunks[x][y]
    //cycle through the rows
    chunks.forEach((row, y) => {
        //cycle through the chunks in a row
        row.forEach((currentChunk, x) => {
            //create gameoffset, this compensates for the screensize, and the camera pos
            let gameXOffset = gameCamera.x - ((screenW) / 2) + (offset / 2);
            let gameYOffset = gameCamera.y - ((screenH) / 2) + (offset / 2);
            //if onscreen where would the chunk be
            let chunkXOnScreen = x * gameSize.chunk - gameXOffset;
            let chunkYOnScreen = y * gameSize.chunk - gameYOffset;

            if (insideScreen(chunkXOnScreen, chunkYOnScreen, gameSize.chunk + offset, gameSize.chunk + offset)) {
                //if its undefined then generate it
                if (chunks[x][y] == "") {
                    generateChunk(x, y);
                }
                onscreenChunks.push(chunks[x][y]);
            }
        });
    });
}
function renderStuff(plantsToRender, animalsToRender) {
    draw.beginPath();
    setcolor("rgba(12,46,32,0.5)");
    plantsToRender.forEach((plant) => plant.shadow());
    draw.fill();

    draw.beginPath();
    setcolor("#4d2d14");
    draw.lineWidth = 18;
    plantsToRender.forEach((plant) => plant.brown());
    draw.stroke();

    draw.beginPath();
    setcolor("#08562e");
    plantsToRender.forEach((plant) => plant.darkGreen());
    draw.fill();

    draw.beginPath();
    setcolor("#096e40");
    plantsToRender.forEach((plant) => plant.green());
    draw.fill();

    draw.beginPath();
    setcolor("#1f7c43");
    plantsToRender.forEach((plant) => plant.lightGreen());
    draw.fill();

    draw.beginPath();
    setcolor("#1f7c43");
    plantsToRender.forEach((plant) => plant.lightGreen());
    draw.fill();

    draw.beginPath();
    setcolor("#FF0000");
    plantsToRender.forEach((plant) => plant.red());
    draw.fill();

    draw.beginPath();
    setcolor("#808080");
    animalsToRender.forEach((animal) => animal.grey());
    draw.fill();

     //we would move all the animals here
     draw.beginPath();
     setcolor("#ff69b4");
     animalsToRender.forEach((animal) => { animal.move(); animal.debug();});
     plantsToRender.forEach((plant) => { plant.grow(); plant.debug();});
     draw.fill();

    draw.lineWidth = 2;
    draw.beginPath();
    setcolor("#000000");
    onscreenChunks.forEach((chunk) => {
        chunk.draw();
    });
    draw.stroke();
}
function calcTps() {
    //tps
    const now = performance.now();;
    msSinceLastFrame = now - times;
    tps = Math.round(1000 / msSinceLastFrame);
    times = now;
}
let plantsToRender = [];
function tick() {
    calcTps();
    //if tps == 0 then the user is in another tab or somthing so dont run the game
    if (tps == 0) {
        console.log("tab not open");
    } else {
        //set ticks per hour to frames per second times seconds per game hour(60)
        ticksPerHour = 60 * tps;
        //set ticks per second to frames per second
        ticksPerSecond = tps;
        //if tps is lower multiply by a higher number
        movementComp = 60 / tps;
        updateClock();
        mainCharacter.move(movement.speed, movement.cx, movement.cy)
        gameCamera.move(cameraSpeed, mainCharacter.x, mainCharacter.y);
        //hunger and stuff
        mainCharacter.tickSurvival();
        //green background
        grass.draw();
        //finds onscreen chunks, if not generated generate them
        findChunks();
        plantsToRender = [];
        let animalsToRender = [];
        onscreenChunks.forEach((chunk) => {
            //combine all of the stuff to render onto one list
            plantsToRender = plantsToRender.concat(chunk.plants);
            //chunks will also have animals and stuff to add
            animalsToRender = animalsToRender.concat(...chunk.animals);
        });
        //we need to identify what things are in touching distance
        touchableThings = [];
        interactObject = "";
        //plants are interactable so this is what does that
        plantsToRender.forEach(plant => {
            //find distance between us and plant
            let xDiff = mainCharacter.x - plant.x;
            let yDiff = mainCharacter.y - plant.y;
            let distance = Math.sqrt((xDiff*xDiff)  + (yDiff*yDiff));
            if (distance < reachDistance) {
                //rn only bushes are interactable
                if (plant instanceof bush) {
                    touchableThings.push(plant);
                }
            }
        });
        //animals are not interactable but if they are near the player they will see you
        animalsToRender.forEach(animal => {
            //find distance between us and plant
            let xDiff = mainCharacter.x - animal.x;
            let yDiff = mainCharacter.y - animal.y;
            let distance = Math.sqrt((xDiff*xDiff)  + (yDiff*yDiff));
            if (distance < conf.animalSight) {
                animal.canSeePlayer = true;
            }else{
                animal.canSeePlayer = false;
            }
        });
        if (touchableThings.length !== 0) {
            interactObject = touchableThings[0];
        }
        //render
        renderStuff(plantsToRender, animalsToRender);
        //the other stuff
        mainCharacter.draw();
        hotbar.render();
        bars.health.draw(mainCharacter.health, bars.hthColor);
        bars.hunger.draw(mainCharacter.hunger, bars.hngColor);
        bars.temp.draw(mainCharacter.temp, tempToColor(mainCharacter.temp));
        drawText(ticksPerSecond, screenW - 30, 20, 30);
        //Object.keys(everything);
    }
    window.requestAnimationFrame(tick);
}
function findThingClosestToPlayer(tp){
    let closest = 10000000000000000000000000000000;
    let item;
    plantsToRender.forEach(plant => {
        //find distance between us and plant
        let xDiff = plant.x - mainCharacter.x;
        let yDiff = plant.y-mainCharacter.y;
        let distance = Math.sqrt((xDiff*xDiff) + (yDiff*yDiff));
        if (distance < closest) {
            closest = distance;
            item = plant
        }
    });
    if(tp){
        mainCharacter.x = item.x;
        mainCharacter.y = item.y;

    }
    item.isdebug = true;
    return item;
}
function die(){
    window.location.reload()
}
start();