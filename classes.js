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
        //die
        if (this.health == 0) {
            die();
        }
    }
}
class bar {
    constructor(x, y, width, height) {
        //center location
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    draw(fillLevel, color) {
        draw.beginPath();
        setcolor(color);
        stborderRect(this.x, this.y, this.width, this.height)
        draw.stroke();
        draw.beginPath();
        staticRect(this.x + 2, this.y + 2, (this.width * (fillLevel / 100)) - 4, this.height - 4);
        draw.fill();
    }
}
class chunk {
    rndLocInChunk(XorY) {
        if (XorY == "x") {
            return this.random(this.startX, this.endX)
        } else {
            return this.random(this.startY, this.endY)
        }
    }
    constructor(property) {
        this.x = property.x;
        this.y = property.y
        this.startX = property.startX;
        this.startY = property.startY;
        this.endX = property.endX;
        this.endY = property.endY;
        this.color = property.color;
        this.seed = property.seed;
        this.plants = [];
        this.animals = new Set();
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
        if (this.random(1, property.chanceOfWolf) == 1) {
            this.animals.add(
                new wolf(this.rndLocInChunk("x"), this.rndLocInChunk("y"), this.seed, this.x, this.y)
            );
        }
    }
    draw() {
        //draw chunk
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
        this.seed = seed;
        this.x = x;
        this.y = y;
        //create branches object with the center branch
        this.branches = {
            x: [x],
            y: [y],
            size: [this.random(75, 100)],
            innerXOffset: [this.random(0, 8)],
            innerYOffset: [this.random(-8, 0)],
        };
        //number of side brancehs
        this.branchNumber = this.random(0, 3) + 1;
        //how far the branches have to be from main branch
        const mainSize = this.branches.size[0] / 2
        //create the branches
        for (let i = 1; i < this.branchNumber; i++) {
            this.branches.size.push(this.random(40, 50));
            const minDist = mainSize + (this.branches.size[i] / 2);
            if (this.random(1, 2) == 1) {
                this.branches.x.push(x + (minDist + 12) * this.negOrPos())
                this.branches.y.push(y + this.random(-minDist, minDist));
            } else {
                this.branches.y.push(y + (minDist + 12) * this.negOrPos())
                this.branches.x.push(x + this.random(-minDist, minDist));
            }
            this.branches.innerYOffset.push(this.random(-8, 0));
            this.branches.innerXOffset.push(this.random(0, 8));
        }
    }
    negOrPos() {
        return this.random(0, 1) < 0.5 ? -1 : 1
    }
    //random function for the tree that uses the trees seed
    random(min, max) {
        this.seed = (this.seed * 387420489 + 14348907) % 1e9;
        return Math.floor(getRandom(this.seed) * (max - min + 1) + min);
    }
    shadow() {
        //draw shadow
        for (let i = 0; i < this.branches.x.length; i++) {
            rRect(this.branches.x[i], this.branches.y[i] + 10, this.branches.size[i] + 4, this.branches.size[i] + 4, 10);
            line(this.branches.x[0], this.branches.y[0] + 10, this.branches.x[i], this.branches.y[i] + 10, 18);
        }
    }
    //draw all brown parts of tree
    brown() {
        //draw branches
        for (let i = 0; i < this.branches.x.length; i++) {
            line(this.branches.x[0], this.branches.y[0], this.branches.x[i], this.branches.y[i]);
        }
    }
    //draw all {color here} parts of tree
    darkGreen() {
        //draw leaves outline
        for (let i = 0; i < this.branches.x.length; i++) {
            rRect(this.branches.x[i], this.branches.y[i], this.branches.size[i] + 4, this.branches.size[i] + 4, 10);
        }
    }
    //draw all {color here} parts of tree
    green() {
        //draw leaves
        for (let i = 0; i < this.branches.x.length; i++) {
            rRect(this.branches.x[i], this.branches.y[i], this.branches.size[i], this.branches.size[i], 10);
        }
    }
    //draw all {color here} parts of tree
    lightGreen() {
        //draw innerleaves
        for (let i = 0; i < this.branches.x.length; i++) {
            rRect(this.branches.x[i] + this.branches.innerXOffset[i], this.branches.y[i] + this.branches.innerYOffset[i], this.branches.size[i] - 20, this.branches.size[i] - 20, 10);
        }
    }
    debug() {
        if (this.isdebug) {
            circle(this.x, this.y, 150, 150);
        }
    }
    red() {

    }
    grow(clock) {

    }
}
class bush {
    constructor(x, y, seed) {
        this.x = x;
        this.y = y;
        this.seed = seed;
        this.berries = [];
        this.nextGrowTime = this.random(conf.maxGrowSpeed, conf.minGrowSpeed)
        //anywhere from 3 to 7 berry positions
        for (let index = 0; index < this.random(conf.minBerries, conf.maxBerries); index++) {
            this.berries.push({ x: this.random(-25, 25), y: this.random(-25, 25), hasBerry: this.random(0, 1) })
        }
    }
    grow() {
        //at 60 fps this would be -1 but we must compensate for fps
        this.nextGrowTime -= movementComp;
        if (this.nextGrowTime <= 0) {
            this.nextGrowTime = this.random(conf.maxGrowSpeed, conf.minGrowSpeed)
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
        //find a berry
        for (let index = 0; index < this.berries.length; index++) {
            const berry = this.berries[index];
            if (berry.hasBerry == 1) {
                //try to add berry
                if (hotbar.addItem("berry")) {
                    berry.hasBerry = 0;
                }
                return
            }
        }

    }
    green() {
        circle(this.x, this.y, 75, 75);
    }
    debug() {
        if (this.isdebug) {
            circle(this.x, this.y, 150, 150);
        }
    }
    red() {
        this.berries.forEach(berry => {
            if (berry.hasBerry) {
                circle(berry.x + this.x, berry.y + this.y, 10, 10);
            }
        });
    }
    shadow() {
        circle(this.x, this.y + 3, 75, 75);

    }
    //draw all {color here} parts of bush
    brown() {

    }
    darkGreen() {

    }
    lightGreen() {

    }
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
        //center location
        this.x = ((gameSize.x * gameSize.chunk) / 2);
        this.y = ((gameSize.y * gameSize.chunk) / 2);
        this.xMomentum = 0;
        this.yMomentum = 0;
    }
    move(cameraSpeed, goalx, goaly) {
        this.xMomentum = ((goalx - this.x) / (cameraSpeed));
        this.yMomentum = ((goaly - this.y) / (cameraSpeed));
        this.x += this.xMomentum * movementComp;
        this.y += this.yMomentum * movementComp;
    }
}
class inventory {
    constructor() {
        //array of items
        this.array = [{ name: "", quantity: 0 },
        { name: "", quantity: 0 },
        { name: "", quantity: 0 },
        { name: "", quantity: 0 },
        { name: "", quantity: 0 },
        { name: "", quantity: 0 },
        { name: "", quantity: 0 },
        { name: "", quantity: 0 },
        { name: "", quantity: 0 },
        { name: "", quantity: 0 }]
        //badly named. the x coord of the current box
        this.firstboxx = 0
        //how wide and tall the boxes are
        this.boxheight = 75;
        //how wide and tall the selected box is
        this.sboxheight = 85;
        this.stacksize = 5;
        //selected slot
        this.selectedSlot = 0;
    }
    addItem(item) {
        //loop through our array
        for (let i = 0; i < 10; i++) {
            //if we already have a stack of the item and it has room 
            if (item == this.array[i].name && this.array[i].quantity < this.stacksize) {
                // log shit for debugging
                // console.log(this.array[i].name);
                // console.log(item)

                //add an item to that stacks
                this.array[i].quantity += 1;
                //logs where it was added and the inventory array
                console.log(`Added ${this.array[i].name} in prexisting slot`)
                //item is added. return.
                return true;
            }
        }
        //once we find that we can't put item in any existing parts we loop again
        if (this.array[this.selectedSlot].quantity == 0) {
            //make the stack be the item
            this.array[this.selectedSlot].name = item;
            //add the item (it could just be = 1 but idc)
            this.array[this.selectedSlot].quantity += 1;
            //log that we added it and return because we did
            console.log(`Added ${this.array[this.selectedSlot].name} in new slot`)
            return true;
        }
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
        //if we couldn't fit an item, return
        return false
    }
    //draws the inventory
    render() {
        //set us to have our box start in the corner
        this.firstboxx = 0;
        //draw big background box
        setcolor("black");
        draw.beginPath();
        //x is on the left, y is up from the bottom by the height of the box, width is 10 boxes, height is 1 box
        staticRect(this.firstboxx, screenH - this.boxheight, this.boxheight * 10, this.boxheight);
        draw.fill();

        setcolor("white");
        draw.beginPath();
        //loop for the 10 white interior boxes
        for (let i = 0; i < 10; i++) {
            //draw the box
            //x is down a tenth of the box (i should use a var instead of 10)
            staticRect(this.firstboxx + this.boxheight / 10, screenH - this.boxheight + this.boxheight / 10, this.boxheight - this.boxheight / 5, this.boxheight - this.boxheight / 5);
            this.firstboxx += this.boxheight;
        }
        //draw a bigger box for the one thats selected
        staticRect(this.boxheight * this.selectedSlot + this.boxheight / 10 - (this.sboxheight - this.boxheight) / 2, screenH - this.boxheight + this.boxheight / 10 - (this.sboxheight - this.boxheight) / 2, this.sboxheight - this.sboxheight / 5, this.sboxheight - this.sboxheight / 5);

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
                staticCircle((this.firstboxx + (this.boxheight / 2)) - 5, (screenH - this.boxheight + (this.boxheight / 2)) - 5, this.boxheight / 2.5, this.boxheight / 2.5);
                draw.fill();
                //move to next position
            }
            this.firstboxx += this.boxheight;
            //do more if statements for more items. to add: number amounts. can't be too hard
        }
        this.firstboxx = 0;
        //loop through boxes
        for (let i = 0; i < 10; i++) {
            //if item write amount
            if (this.array[i].quantity > 0) {
                //draw
                drawText(`${this.array[i].quantity}`, this.firstboxx + this.boxheight - 25, screenH - this.boxheight + 55, 20)
            }
            this.firstboxx += this.boxheight;//do more if statements for more items. to add: number amounts. can't be too hard
        }
        this.firstboxx = 0;
        for (let i = 0; i < 10; i++) {
            //if slot draw dot
            if (i == this.selectedSlot) {
                //draw
                setcolor("yellow")
                draw.beginPath();
                staticCircle((this.firstboxx + (this.boxheight / 2)), (screenH - this.boxheight + (this.boxheight / 2)), this.boxheight / 5, this.boxheight / 5);
                draw.fill();
                //move to next position

            }
            this.firstboxx += this.boxheight;
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
}
class wolf {
    constructor(x, y, seed, chunkx, chunky) {
        this.chunkx = chunkx;
        this.chunky = chunky;
        this.canSeePlayer = false;
        this.seed = seed;
        this.x = x;
        this.y = y;
        this.health = 100;
        this.speed = conf.wolfSpeed;

        //how far along the bezier curve we are
        this.t = 0.5;

        this.pastLoc = this.randomPosition(this.x, this.y, 500); 
        this.currentLoc = [this.x, this.y];
        this.goalLoc = this.randomPosition(this.x, this.y, 500);
    }
    //random function for the wolf that uses the wolfs seed
    random(min, max) {
        this.seed = (this.seed * 387420489 + 14348907) % 1e9;
        return Math.floor(getRandom(this.seed) * (max - min + 1) + min);
    }
    //draw all {color here} parts of wolf
    grey() {
        circle(this.x, this.y, 50, 50)
    }
    debug() {
        if (this.isdebug) {
            circle(this.x, this.y, 150, 150);
        }
    }
    move() {
        //we must hunt the player if visible
        if(this.canSeePlayer){
            this.pastLoc = this.currentLoc;
            this.currentLoc = [this.x, this.y];
            this.goalLoc = [mainCharacter.x, mainCharacter.y];
            this.t = 0.5;
        }

        let newLoc = this.nextPoint(this.pastLoc, this.currentLoc, this.goalLoc, [this.x, this.y], this.speed*movementComp);
        if(newLoc == "end"){
            console.log("end");
            this.pastLoc = this.currentLoc;
            this.currentLoc = this.goalLoc;
            this.goalLoc = this.randomPosition(this.goalLoc[0], this.goalLoc[1], 500);
            this.t = 0.5;
            newLoc = this.nextPoint(this.pastLoc, this.currentLoc, this.goalLoc, [this.x, this.y], this.speed*movementComp);
        }
        this.x = newLoc[0];
        this.y = newLoc[1];
    
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
        if (newx != this.chunkx || newy != this.chunky) {
            console.log("we were at " + [this.chunkx, this.chunky] + " but now were at " + [newx, newy] + " heres x and y " + [this.x, this.y]);
            chunks[this.chunkx][this.chunky].animals.delete(this);
            //generate chunk if needed
            if (chunks[newx][newy] == "") {
                generateChunk(newx, newy);
            }
            chunks[newx][newy].animals.add(this);

            this.chunkx = newx;
            this.chunky = newy;
        }
    }
    randomPosition(startx, starty, distance) {
        let distanceBetweenX = this.random(-distance, distance);
        let newx = startx + distanceBetweenX;
        //b squared  = c squared minus a squared
        //b = sqrt(c squared minus a squared)
        let distanceBetweenY = Math.sqrt(distance ** 2 - distanceBetweenX ** 2) * this.negitiveOrPositive();
        let newy = starty + distanceBetweenY;
        return [newx, newy]
    }
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
            nextPoint = this.bezierCurveWithMidpoint(p0, p1, p2,  this.t);
    
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