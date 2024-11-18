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
        //if you wonder why its is calculated seperatly its because worst case you can be farther from
        //the best hunger than you can be from the best temp, so this makes them matter equally
        const tempFraction = tempDiff / this.healing.bestTemp;
        const hungerFraction = hungerDiff / this.healing.bestHunger;
        //convert the individual fractions to one fraction on the same scale
        const healScoreFraction = (tempFraction + hungerFraction) / 2;
        //right now healing is just as easy as losing health, this is too easy, fix it by multiplying by healdifficulty
        //the best case stays as 0 but the wort case becomes healdifficulty
        const scaledHealScoreFraction = healScoreFraction * this.healing.healDifficulty;
        //subtract it from 1, now the best would be 1 and the worst would be 1-healDifficulty
        this.healScore = 1 - scaledHealScoreFraction
        //max healing ammount
        const maxHeal = 20;
        //change health, see now that best case would be you heal the value of maxheal
        //but worst case you loze healdifficutly times maxheal
        this.health += (maxHeal * this.healScore) / ticksPerHour
        //make the values be in between 0 and 100
        this.health = clamp(this.health, 0, 100);
        this.hunger = clamp(this.hunger, 0, 100);
        this.temp = clamp(this.temp, 0, 100);
        //die
        if (this.health == 0) {
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
        this.startX = property.startX;
        this.startY = property.startY;
        this.endX = property.endX;
        this.endY = property.endY;
        this.color = property.color;
        this.seed = property.seed;
        this.plants = [];
        for (let i = 0; i < property.treeNumber; i++) {
            this.plants.push(
                new tree(this.rndLocInChunk("x"), this.rndLocInChunk("y"), i * this.seed)
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
    dbranches() {

        //draw branches
        for (let i = 0; i < this.branches.x.length; i++) {
            line(this.branches.x[0], this.branches.y[0], this.branches.x[i], this.branches.y[i]);
        }
    }
    lOutline() {
        //draw leaves outline
        for (let i = 0; i < this.branches.x.length; i++) {
            rRect(this.branches.x[i], this.branches.y[i], this.branches.size[i] + 4, this.branches.size[i] + 4, 10);
        }
    }
    leaves() {
        //draw leaves
        for (let i = 0; i < this.branches.x.length; i++) {
            rRect(this.branches.x[i], this.branches.y[i], this.branches.size[i], this.branches.size[i], 10);
        }
    }
    lInside() {
        setcolor("#1f7c43");
        //draw innerleaves
        for (let i = 0; i < this.branches.x.length; i++) {
            rRect(this.branches.x[i] + this.branches.innerXOffset[i], this.branches.y[i] + this.branches.innerYOffset[i], this.branches.size[i] - 20, this.branches.size[i] - 20, 10);
        }
    }
    grow(clock) {

    }
}
class bush {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    draw() {
        circle(this.x, this.y, 50, 50);
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
        this.xMomentum = ((goalx - this.x) / cameraSpeed);
        this.yMomentum = ((goaly - this.y) / cameraSpeed);
        this.x += this.xMomentum*movementComp;
        this.y += this.yMomentum*movementComp;
    }
}