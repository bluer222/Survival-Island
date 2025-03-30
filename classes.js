class player {
    constructor(healing) {
        //center location
        this.x = ((gameSize.x * gameSize.chunk) / 2);
        this.y = ((gameSize.y * gameSize.chunk) / 2);
        //hunger, 0=very hungry 100=full
        this.hunger = 100;
        //tempature, 100=on fire 0=frozen (50 perfered)
        this.temp = 60;
        //health, 100=full 0=dead
        this.health = 100;
        //redefine healing settings for reference
        this.healing = {
            //deffault ammount hunger and temp go down each hour
            hungerRate: healing.hungerRate,
            tempRate: healing.tempRate,
            //how much extra your hunger goes down when sprinting
            sprintRate: 10,
            //healing will be fastest with hunger and temp at these values
            bestHunger: healing.bestHunger,
            bestTemp: healing.bestTemp,
            //increasing this reduces the area where your close enough to optimal for you to heal
            //it also makes you lose health faster
            healDifficulty: healing.healDifficulty,
            //how quickly your health goes up or down
            healRate: healing.healRate
        };
        this.healScore = 0;
    }
    draw() {
        //draw the player
        draw.beginPath();
        setcolor("tan");
        circle(this.x, this.y, 50, 50);
        draw.fill();
    }
    move(speed, movementx, movementy) {
        // Apply movement with adjusted speed
        //multiply by 60/tps so that if tps is lower than 60 it will go faster
        this.x += movementx * speed * movementComp;
        this.y += movementy * speed * movementComp;
    }
    //this function runs every tick so changes must be devided by the number of ticks in an hour
    tickSurvival() {
        //increase hunger
        this.hunger -= (this.healing.hungerRate / ticksPerHour);
        //decreace tempeture
        this.temp -= (this.healing.tempRate / ticksPerHour);

        //difference between optimal and current temp
        const tempDiff = Math.abs(this.healing.bestTemp - this.temp);
        //difference between optimal and current hunger
        const hungerDiff = Math.abs(this.healing.bestHunger - this.hunger);
        //devide your socre by the worst one to get a decimal where 1 = your trash and 0 = your perfect
        //if you wonder why its is calculated seperatly its because:
        //worst hunger you can be(0) is farther from perfect hunger(100) than the worst temp(0) is from the perfect temp(60)
        //so this makes them matter equally
        const tempFraction = tempDiff / this.healing.bestTemp;
        const hungerFraction = hungerDiff / this.healing.bestHunger;
        //convert the individual fractions to one fraction. devide by 2 to turn it from a 0-2 scale to a 0-1 scale
        const healScoreFraction = (tempFraction + hungerFraction) / 2;
        //right now healing is just as easy as losing health, this is too easy, fix it by multiplying by healdifficulty
        //the best case stays as 0 but the wort case becomes healdifficulty instead of 1
        const scaledHealScoreFraction = healScoreFraction * this.healing.healDifficulty;
        //subtract it from 1, now the best would be 1 and the worst would be 1-healDifficulty
        this.healScore = 1 - scaledHealScoreFraction
        //max healing ammount
        const maxHeal = 20;
        //change health, see now that best case would be you gain 1*maxheal
        //but worst case you lose healdifficutlty*maxheal
        this.health += (maxHeal * this.healScore) / ticksPerHour
        //make the values be in between 0 and 100
        this.health = clamp(this.health, 0, 100);
        this.hunger = clamp(this.hunger, 0, 100);
        this.temp = clamp(this.temp, 0, 100);
        //die if our health is 0
        if (this.health == 0) {
            die();
        }
    }
}
class bar {
    constructor(x, y, width, height) {
        //store our variables
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    draw(fillLevel, color) {
        //draw the border around the outside
        draw.beginPath();
        setcolor(color);
        stborderRect(this.x, this.y, this.width, this.height)
        draw.stroke();
        //draw the bar itself with 2px of gap on all sides, 1px for border and 1px just as gap
        draw.beginPath();
        staticRect(this.x + 2, this.y + 2, (this.width * (fillLevel / 100)) - 4, this.height - 4);
        draw.fill();
    }
}
class chunk {
    //creates a random x or y location in the chunk
    rndLocInChunk(XorY) {
        if (XorY == "x") {
            return this.random(this.startX, this.endX)
        } else {
            return this.random(this.startY, this.endY)
        }
    }
    constructor(property) {
        //chunk cordinates, the chunk at the top left would be 0, 0 then below that is 0, 1
        this.x = property.x;
        this.y = property.y
        //start and end cordinates, the top left chunk is from 0, 0 to 1000, 1000(at time of writing gamesize.chunk = 1000)
        this.startX = property.startX;
        this.startY = property.startY;
        this.endX = property.endX;
        this.endY = property.endY;
        //seed of the chunk, variants of this are passed to the trees etc
        this.seed = property.seed;
        //array of plant in the chunk
        this.plants = [];

        //animals must be a set instead because animals often move between chunks
        //unlike arrays you can do set.delete(element) instead of finding indexof element then deleting that index from the list
        this.animals = new Set();
        //items must also be a set because they get deleted and added 
        this.items = new Set();
        //add a number of trees and bushes equal to treenumber, asign seeds based on order of adding
        for (let i = 0; i < property.treeNumber; i++) {
            this.plants.push(
                new tree(this.rndLocInChunk("x"), this.rndLocInChunk("y"), i * this.seed)
            );
        }
        for (let i = 0; i < property.bushNumber; i++) {
            this.plants.push(
                new bush(this.rndLocInChunk("x"), this.rndLocInChunk("y"), i * this.seed)
            );
        }
        //add a wolf based on chance, give it the chunk x and y so it can remove itself when entering a new chunk
        if (this.random(1, property.chanceOfWolf) == 1) {
            this.animals.add(
                new wolf(this.rndLocInChunk("x"), this.rndLocInChunk("y"), this.seed, this.x, this.y)
            );
        }
    }
    draw() {
        //draw chunk border
        borderRect(this.startX, this.startY, gameSize.chunk, gameSize.chunk);
    }
    //random function for the chunk that uses the chunks seed
    random(min, max) {
        this.seed = (this.seed * 387420489 + 14348907) % 1e9;
        return Math.floor(getRandom(this.seed) * (max - min + 1) + min);
    }
}
class tree {
    constructor(x, y, seed) {
        //store the seed and location given by the chunk
        this.seed = seed;
        this.x = x;
        this.y = y;
        this.isdebug = false;
        this.isInteractable = true;
        this.grows = false;
        this.needsPlayerPosition = false;
        this.moves = false;
        //stats of the main branch
        this.size = this.random(75, 100);
        //inside of the tree's leave rectangle theres a smaller light green rectangle
        //this decides how much up and how much to the left it will be
        //why only up and to the left? idfk
        this.innerXOffset = this.random(0, 8);
        this.innerYOffset = this.random(-8, 0);
        //create branches object
        this.branches = {
            x: [],
            y: [],
            size: [],
            innerXOffset: [],
            innerYOffset: [],
        };
        //decide how many side branches to have
        this.branchNumber = this.random(0, 3);
        //how far the branches have to be from main branch
        //we want branches to have a specific ammount of gap from the center
        const mainSize = this.size / 2
        //create the branches
        for (let i = 0; i < this.branchNumber; i++) {
            //add a branch of random size
            this.branches.size.push(this.random(40, 50));
            //how far away from the center will this branch need to be, we add 12px to this later to make a gap
            const minDist = mainSize + (this.branches.size[i] / 2);
            //so basically branches could stick out from 4 different sides
            //a left sticking branch will have an x of - minDist
            //then the y is just randomized
            //first we need to decide between left/right and up/down
            if (this.random(1, 2) == 1) {
                //if our branch is sticking left/right
                //first we set the x, this is either +minDist or +minDist because if it was in the middle the branch could end up inside the tree
                this.branches.x.push((minDist + 12) * this.negOrPos())
                //then we randomize the y
                this.branches.y.push(this.random(-minDist, minDist));
            } else {
                this.branches.y.push((minDist + 12) * this.negOrPos())
                this.branches.x.push(this.random(-minDist, minDist));
            }
            //inside of the tree's leave rectangle theres a smaller light green rectangle
            //this decides how much up and how much to the left it will be
            //why only up and to the left? idfk
            this.branches.innerYOffset.push(this.random(-8, 0));
            this.branches.innerXOffset.push(this.random(0, 8));
        }
    }
    //outputs -1 or 1 so you can multiply by negitiveOrPositive() to get negitive or positive
    negOrPos() {
        return 1 - (2 * this.random(0, 1))
    }
    //random function for the tree that uses the trees seed
    random(min, max) {
        this.seed = (this.seed * 387420489 + 14348907) % 1e9;
        return Math.floor(getRandom(this.seed) * (max - min + 1) + min);
    }
    render(drawColor) {
        if (drawColor == color.shadow) {
            //draw main branch shadow
            rRect(this.x, this.y + 10, this.size + 4, this.size + 4, 10);
            //draw side branches shadow
            for (let i = 0; i < this.branches.x.length; i++) {
                rRect(this.x + this.branches.x[i], this.y + this.branches.y[i] + 10, this.branches.size[i] + 4, this.branches.size[i] + 4, 10);
                //draw line from center banch to side branch
                line(this.x, this.y + 10, this.x + this.branches.x[i], this.y + this.branches.y[i] + 10, 18);
            }
        }
        if (drawColor == color.brown) {
            //draw branches from center to side branches
            for (let i = 0; i < this.branches.x.length; i++) {
                line(this.x, this.y, this.x + this.branches.x[i], this.y + this.branches.y[i]);
            }
        }
        if (drawColor == color.darkGreen) {
            //draw main branch
            rRect(this.x, this.y, this.size + 4, this.size + 4, 10);
            //draw leaves outline
            for (let i = 0; i < this.branches.x.length; i++) {
                rRect(this.x + this.branches.x[i], this.y + this.branches.y[i], this.branches.size[i] + 4, this.branches.size[i] + 4, 10);
            }
        }
        if (drawColor == color.green) {
            //draw main branch
            rRect(this.x, this.y, this.size, this.size, 10);
            //draw leaves
            for (let i = 0; i < this.branches.x.length; i++) {
                rRect(this.x + this.branches.x[i], this.y + this.branches.y[i], this.branches.size[i], this.branches.size[i], 10);
            }
        }
        if (drawColor == color.lightGreen) {
            //draw main innerleaves
            rRect(this.x + this.innerXOffset, this.y + this.innerYOffset, this.size - 20, this.size - 20, 10);
            //draw innerleaves
            for (let i = 0; i < this.branches.x.length; i++) {
                rRect(this.x + this.branches.x[i] + this.branches.innerXOffset[i], this.y + this.branches.y[i] + this.branches.innerYOffset[i], this.branches.size[i] - 20, this.branches.size[i] - 20, 10);
            }
        }
    }
    //if we are debugging then draw a pink circle around it
    debug() {
        if (this.isdebug) {
            circle(this.x, this.y, 150, 150);
        }
    }
    grow(clock) {
    }
}
class bush {
    constructor(x, y, seed) {
        //store the seed and location given by the chunk
        this.x = x;
        this.y = y;
        this.seed = seed;
        this.isdebug = false;
        this.isInteractable = true;
        this.grows = true;
        this.needsPlayerPosition = false;
        this.moves = false;
        ///this is how many ticks it will be before one of the berries grows
        this.nextGrowTime = this.random(conf.maxGrowSpeed, conf.minGrowSpeed)
        //this will store our barries
        this.berries = [];
        //anywhere from conf.minBerries(3) to conf.maxBerries(7) berry positions
        //each of these barries have an x and y offsetted by an ammount from the center
        for (let index = 0; index < this.random(conf.minBerries, conf.maxBerries); index++) {
            this.berries.push({ x: this.random(-25, 25), y: this.random(-25, 25), hasBerry: this.random(0, 1) })
        }
    }
    grow() {
        //at 60 fps this would be -1 but we must compensate for fps
        this.nextGrowTime -= movementComp;
        //if the time has passed
        if (this.nextGrowTime <= 0) {
            //set a new growtime
            this.nextGrowTime = this.random(conf.maxGrowSpeed, conf.minGrowSpeed)
            //go through the berries and grow the first open one on th elist
            for (let index = 0; index < this.berries.length; index++) {
                const berry = this.berries[index];
                if (berry.hasBerry == 0) {
                    berry.hasBerry = 1;
                    return
                }
            }
        }
    }
    interact() {
        //go through the berry list and find a grown one
        for (let index = 0; index < this.berries.length; index++) {
            const berry = this.berries[index];
            if (berry.hasBerry == 1) {
                //try to add berry
                if (hotbar.addItem("berry")) {
                    //if sucessfully added then remove the berry
                    berry.hasBerry = 0;
                }
                return
            }
        }

    }
    render(drawColor) {
        if (drawColor == color.shadow) {
            circle(this.x, this.y + 3, 75, 75);
        }
        if (drawColor == color.green) {
            circle(this.x, this.y, 75, 75);
        }
        if (drawColor == color.red) {
            this.berries.forEach(berry => {
                if (berry.hasBerry) {
                    circle(berry.x + this.x, berry.y + this.y, 10, 10);
                }
            });
        }
    }

    //if we are debugging then draw a pink circle around it
    debug() {
        if (this.isdebug) {
            circle(this.x, this.y, 150, 150);
        }
    }
    //random function using the seed
    random(min, max) {
        this.seed = (this.seed * 387420489 + 14348907) % 1e9;
        return Math.floor(getRandom(this.seed) * (max - min + 1) + min);
    }
}
class backround {
    constructor(color) {
        //center location
        this.color = color;
        this.x = 0;
        this.y = 0;
    }
    draw() {
        draw.beginPath();
        setcolor(this.color);
        rect(this.x, this.y, gameSize.x * gameSize.chunk, gameSize.y * gameSize.chunk);
        draw.fill();
    }
}
class camera {
    constructor() {
        //we start with a centered locaton and no momentum
        this.x = ((gameSize.x * gameSize.chunk) / 2);
        this.y = ((gameSize.y * gameSize.chunk) / 2);
        this.xMomentum = 0;
        this.yMomentum = 0;
    }
    move(cameraSpeed, goalx, goaly) {
        //this will make it so that we move twards the player fast when thier far away but slow when thier close
        this.xMomentum = ((goalx - this.x) / (cameraSpeed));
        this.yMomentum = ((goaly - this.y) / (cameraSpeed));
        //multiply by movementComp so even in low fps it moves the same speed
        this.x += this.xMomentum * movementComp;
        this.y += this.yMomentum * movementComp;
    }
}
class inventory {
    constructor() {
        //create array of items
        this.array = [{ name: "", quantity: 0 },
        { name: "", quantity: 0 },
        { name: "", quantity: 0 },
        { name: "", quantity: 0 },
        { name: "", quantity: 0 },
        { name: "", quantity: 0 },
        { name: "", quantity: 0 },
        { name: "", quantity: 0 },
        { name: "", quantity: 0 },
        { name: "", quantity: 0 }];
        //how wide and tall the boxes are
        this.boxheight = 75;
        //how wide and tall the selected box is
        this.sboxheight = 85;
        this.stacksize = 5;
        //selected slot
        this.selectedSlot = 0;
        //find how wide the bar is 
        this.width = this.boxheight * 10;
    }
    addItem(item) {
        //loop through our array
        for (let i = 0; i < 10; i++) {
            //if we already have a stack of the item and it has room 
            if (item == this.array[i].name && this.array[i].quantity < this.stacksize) {
                //add an item to that stack
                this.array[i].quantity += 1;
                //logs where it was added and the inventory array
                console.log(`Added ${this.array[i].name} in prexisting slot`)
                //item is added. return.
                return true;
            }
        }
        //if there is no open slot then we add to the selected slot if open
        //this makes more sense than adding to the first slot
        if (this.array[this.selectedSlot].quantity == 0) {
            //make the stack be the item
            this.array[this.selectedSlot].name = item;
            //add the item (it could just be = 1 but idc)
            this.array[this.selectedSlot].quantity += 1;
            //log that we added it and return because we did
            console.log(`Added ${this.array[this.selectedSlot].name} in new slot`)
            return true;
        }
        //ok now we just go through the list for any empty slot
        for (let i = 0; i < 10; i++) {
            //if this slot is empty
            if (this.array[i].quantity == 0) {
                //make the stack be the item
                this.array[i].name = item;
                //add the item (it could just be = 1 but idc)
                this.array[i].quantity += 1;
                //log that we added it and return because we did
                console.log(`Added ${this.array[i].name} in new slot`)
                return true;
            }
        }
        //if we reached this point without returng then theres no space, return false
        return false
    }
    //draws the inventory
    render() {
        //the x coordinate of the first box
        //used for centering the inventory bar
        this.startx = (screenW - this.width) / 2;
        //draw big background box
        setcolor("black");
        draw.beginPath();
        //x starts at startx , y is up from the bottom by the height of the box, width is 10 boxes, height is 1 box
        staticRect(this.startx, screenH - this.boxheight, this.boxheight * 10, this.boxheight);
        draw.fill();

        setcolor("white");
        draw.beginPath();
        //loop for the 10 white interior boxes
        for (let i = 0; i < 10; i++) {
            //draw the box
            //x is down a tenth of the box (i should use a var instead of 10)
            staticRect(this.startx + i * this.boxheight + this.boxheight / 10, screenH - this.boxheight + this.boxheight / 10, this.boxheight - this.boxheight / 5, this.boxheight - this.boxheight / 5);
        }

        //draw a bigger box for the one thats selected
        staticRect(this.startx + this.boxheight * this.selectedSlot + this.boxheight / 10 - (this.sboxheight - this.boxheight) / 2, screenH - this.boxheight + this.boxheight / 10 - (this.sboxheight - this.boxheight) / 2, this.sboxheight - this.sboxheight / 5, this.sboxheight - this.sboxheight / 5);
        draw.fill();

        //reset the x box (i think of it as a cursor)
        this.firstboxx = 0;
        //loop through boxes
        for (let i = 0; i < 10; i++) {
            //if berry draw berry
            if (this.array[i].name == "berry" && this.array[i].quantity > 0) {
                //draw
                setcolor("red")
                draw.beginPath();
                staticCircle(this.startx + (i * this.boxheight + (this.boxheight / 2)) - 5, (screenH - this.boxheight + (this.boxheight / 2)) - 5, this.boxheight / 2.5, this.boxheight / 2.5);
                draw.fill();
                //move to next position
            }
            //do more if statements for more items. to add: number amounts. can't be too hard
        }

        //loop through boxes
        for (let i = 0; i < 10; i++) {
            //if item write amount
            if (this.array[i].quantity > 0) {
                //draw
                drawText(`${this.array[i].quantity}`, this.startx + i * this.boxheight + this.boxheight - 25, screenH - this.boxheight + 55, 20)
            }
        }

        for (let i = 0; i < 10; i++) {
            //if slot draw dot
            if (i == this.selectedSlot) {
                //draw
                setcolor("yellow")
                draw.beginPath();
                staticCircle(this.startx + i * this.boxheight + (this.boxheight / 2), screenH - this.boxheight + (this.boxheight / 2), this.boxheight / 5, this.boxheight / 5);
                draw.fill();
                //move to next position

            }
            //do more if statements for more items. to add: number amounts. can't be too hard
        }
    }
    use() {
        if (this.array[this.selectedSlot].name == "berry") {
            mainCharacter.hunger += 5;
            this.array[this.selectedSlot].quantity -= 1
        }
        if (this.array[this.selectedSlot].quantity <= 0) {
            this.array[this.selectedSlot].name = "";
            this.array[this.selectedSlot].quantity = 0;
        }
    }
    drop() {
        if (this.array[this.selectedSlot].quantity > 0) {
            this.array[this.selectedSlot].quantity -= 1
            let chunk = getChunkFromCoords(mainCharacter.x, mainCharacter.y);
            chunk.items.add(
                new item(this.array[this.selectedSlot].name, mainCharacter.x, mainCharacter.y, chunk.x, chunk.y)
            );
        }
    }
}
class item {
    constructor(name, x, y, chunkx, chunky) {
        //store the name and location given by the chunk
        this.name = name;
        this.x = x;
        this.y = y;
        this.chunkx = chunkx;
        this.chunky = chunky;
        this.isdebug = false;
        this.isInteractable = true;
        this.grows = false;
        this.needsPlayerPosition = false;
        this.moves = false;
    }
    debug() {
        if (this.isdebug) {
            circle(this.x, this.y, 150, 150);
        }
    }
    render(drawColor) {
        if (this.name == "berry") {
            if (drawColor == color.red) {
                circle(this.x, this.y, 10, 10);
            }
        }
    }
    interact() {
        if (hotbar.addItem(this.name)) {
            //if sucessfully added then remove the berry
            chunks[this.chunkx][this.chunky].items.delete(this);
        }
    }
}
class wolf {
    constructor(x, y, seed, chunkx, chunky) {
        //which chunk are we in?
        //top left chunk is 0, 0 then below that is 0, 1
        this.chunkx = chunkx;
        this.chunky = chunky;
        //is the player within seeing range
        this.canSeePlayer = false;
        //store our variables
        this.seed = seed;
        this.x = x;
        this.y = y;
        this.health = 100;
        this.isInteractable = false;
        this.grows = false;
        this.needsPlayerPosition = true;
        this.moves = true;
        //how far along the bezier curve we are
        this.t = 0.5;

        //where we were and where we're going
        this.pastLoc = this.randomPosition(this.x, this.y, 500);
        this.currentLoc = [this.x, this.y];
        this.goalLoc = this.randomPosition(this.x, this.y, 500);
    }
    //random function for the wolf that uses the wolfs seed
    random(min, max) {
        this.seed = (this.seed * 387420489 + 14348907) % 1e9;
        return Math.floor(getRandom(this.seed) * (max - min + 1) + min);
    }
    render(drawColor) {
        if (drawColor == color.grey) {
            circle(this.x, this.y, 50, 50)
        }
    }
    debug() {
        if (this.isdebug) {
            circle(this.x, this.y, 150, 150);
        }
    }
    //heres a summary of how wolves work
    //we draw a bezier curve between our past location our current location and a goal
    //the current location is the midpoint and the others are endpoints
    //we start halfway along the curve because the curve starts at a past location
    //for the next while, we are going to follow this curve
    //we use a besier curve function, it accepts these points and a number from 0-1 of how far along the curve
    //the thing is incrmenting this number by for example 0.1 will not always move the same ammount
    //this.nextpoint increases the number by 0.0001 until the distance between currentlocation and output is > than wolfspeed
    //this is why wolves move slighly faster than conf.wolfspeed
    //when the number reaches 1, we have reached the end of the curve and draw a new curve
    //what used to be currentloc becomes pastloc we update currentloc to be the current loc and we choose a future loc
    //one change we may want to make is when chasing the player, the curve only updates once a second or somthing
    //this will make wolves slow to respond to position changes(we could also make the wolf overshoot the player)
    move() {
        //we must hunt the player if visible
        if (this.distanceToPlayer < conf.animalSight) {
            //set back all the variables and set a new goal of the player
            this.pastLoc = this.currentLoc;
            this.currentLoc = [this.x, this.y];
            this.goalLoc = [mainCharacter.x, mainCharacter.y];
            this.t = 0.5;
        }
        //get the next location along the curve
        let newLoc = this.nextPoint(this.pastLoc, this.currentLoc, this.goalLoc, [this.x, this.y], conf.wolfSpeed * movementComp);
        //if we reached the end of the curve
        if (newLoc == "end") {
            //set back all the variables
            this.pastLoc = this.currentLoc;
            this.currentLoc = this.goalLoc;
            //get a new goal
            this.goalLoc = this.randomPosition(this.goalLoc[0], this.goalLoc[1], 500);
            this.t = 0.5;
            //calculate where to move this tick
            newLoc = this.nextPoint(this.pastLoc, this.currentLoc, this.goalLoc, [this.x, this.y], conf.wolfSpeed * movementComp);
        }
        //move to the new location
        this.x = newLoc[0];
        this.y = newLoc[1];

        //is the player close enough to take damage
        //only calculate if we know we must be close
        if (this.distanceToPlayer < conf.animalRange) {
            //if its within range then attack
            mainCharacter.health -= conf.animalPower / ticksPerSecond;
        }


        this.updateChunk();
    }
    //ok, so we moved, now what chunk are we in
    updateChunk() {

        //to round to the nearest n you devide by n then you cut off decimals then you multiply by n
        //heres an example 540 to the nearest 100
        //540/100 = 5.4             Math.round(5.4) = 5          5*100 = 500

        //but in this case we dont need to multiply at the end because we only want the number

        //also we use floor to round down, chunk 0 is from 0 to 1000, not 0 to 499

        let newx = Math.floor(this.x / gameSize.chunk);
        let newy = Math.floor(this.y / gameSize.chunk);

        //so are we actually in a new chunk
        if (newx != this.chunkx || newy != this.chunky) {
            //fuck we are
            console.log("we were at " + [this.chunkx, this.chunky] + " but now were at " + [newx, newy] + " heres x and y " + [this.x, this.y]);
            //remove ourselves from the old chunk
            chunks[this.chunkx][this.chunky].animals.delete(this);
            //generate the new chunk if needed
            if (chunks[newx][newy] == "") {
                generateChunk(newx, newy);
            }
            //add ourselves to the new chunk
            chunks[newx][newy].animals.add(this);
            //update this so in the future we can remove ourselves again
            this.chunkx = newx;
            this.chunky = newy;
        }
    }
    //makes a random position thats a specific distnace from a start
    randomPosition(startx, starty, distance) {
        //randomly choose a x
        let distanceBetweenX = this.random(-distance, distance);
        let newx = startx + distanceBetweenX;
        //now we must choose a y so the distance is correct
        //b squared  = c squared minus a squared
        //b = sqrt(c squared minus a squared)
        //calculate the y
        let distanceBetweenY = Math.sqrt(distance ** 2 - distanceBetweenX ** 2) * this.negitiveOrPositive();
        let newy = starty + distanceBetweenY;
        return [newx, newy]
    }
    //outputs -1 or 1 so you can multiply by negitiveOrPositive() to get negitive or positive
    negitiveOrPositive() {
        return 1 - (2 * this.random(0, 1))
    }
    /*

                          WARNING!!
            Code beyond this point is ai generated

                Programmer discretion advised

    */
    bezierCurveWithMidpoint(p0, p1, p2, t) {
        /**
         * Calculate a point on a quadratic Bézier curve where p1 is the actual midpoint.
         *
         * Parameters:
         *   p0 (Array): Starting point [x0, y0].
         *   p1 (Array): Midpoint [x1, y1] (true midpoint of the curve).
         *   p2 (Array): Ending point [x2, y2].
         *   t (Number): A value between 0 and 1 representing the position on the curve.
         *
         * Returns:
         *   Array: The [x, y] coordinates of the point on the curve at t.
         */

        // Calculate the control point to ensure p1 is the actual midpoint
        const cx = 2 * p1[0] - (p0[0] + p2[0]) / 2;
        const cy = 2 * p1[1] - (p0[1] + p2[1]) / 2;

        // Quadratic Bézier formula with derived control point
        const x = Math.pow(1 - t, 2) * p0[0] + 2 * (1 - t) * t * cx + Math.pow(t, 2) * p2[0];
        const y = Math.pow(1 - t, 2) * p0[1] + 2 * (1 - t) * t * cy + Math.pow(t, 2) * p2[1];

        return [x, y];
    }
    nextPoint(p0, p1, p2, currentLoc, targetDistance) {
        /**
         * Generate the next point along the Bézier curve at a specified distance from the current point.
         *
         * Parameters:
         *   p0 (Array): Starting point [x0, y0].
         *   p1 (Array): Midpoint [x1, y1].
         *   p2 (Array): Ending point [x2, y2].
         *   currentX (Number): Current x-coordinate on the curve.
         *   currentY (Number): Current y-coordinate on the curve.
         *   targetDistance (Number): The desired distance from the current point to the next point.
         *
         * Returns:
         *   Array: The next point on the curve [nextX, nextY] that is `targetDistance` away from the current point.
         */

        let currentPoint = currentLoc;
        let nextPoint = currentPoint;
        let accumulatedDistance = 0;

        while (accumulatedDistance < targetDistance) {
            // Increment t to move along the curve
            this.t += 0.0001; // Small step to prevent skipping the target distance

            // Stop if t exceeds 1 (end of the curve)
            if (this.t >= 1) {
                return "end";
            }
            // Get the next point on the curve
            nextPoint = this.bezierCurveWithMidpoint(p0, p1, p2, this.t);

            // Calculate the distance from the current point to the next point
            const dx = nextPoint[0] - currentPoint[0];
            const dy = nextPoint[1] - currentPoint[1];
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Accumulate the distance
            accumulatedDistance += dist;
            currentPoint = nextPoint; // Move to the new point
        }

        return nextPoint;
    }
}