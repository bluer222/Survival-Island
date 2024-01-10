class player {
    constructor(healing) {
        //center location
        this.x = (gameSize.x / 2);
        this.y = (gameSize.y / 2);
        //hunger, 0=very hungry 100=full
        this.hunger = 100;
        //tempature, 100=on fire 0=frozen
        this.temp = 75;
        //health, 100=full 0=dead
        this.health = 100;
        //redefine healing settings for reference
        this.healing = {
            //how hard it is to heal(also makes you lose health faster), default is 2, higher is harder, lower is easyer
            healDifficutly: healing.healDifficutly,
            //deffault ammount hunger and temp go down each hour
            hungerRate: healing.hungerRate,
            tempRate: healing.tempRate,
            //healing will be fastest with hunger and temp at these values
            bestHunger: healing.bestHunger,
            bestTemp: healing.bestTemp,
            //how close healscore has to be to 0 for you to heal(if healscore is less than this you heal, if greater you take damage)
            healThreshold: healing.healThreshold
        };        //ticks per hour
        this.ticksPerHour = 60 * 60;
    }
    draw() {
        setcolor("tan");
        circle(this.x, this.y, 50, 50);
    }
    move(speed, movementx, movementy) {
        this.x += movementx * speed; // Apply movement with adjusted speed
        this.y += movementy * speed;
    }
    tickSurvival() {
        //increase hunger
        this.hunger -= (this.healing.hungerRate / this.ticksPerHour);
        //decreace tempeture
        this.temp -= (this.healing.tempRate / this.ticksPerHour);

        //difference between optimal and current temp
        const tempDiff = Math.abs(this.healing.bestTemp - this.temp);
        //difference between optimal and current hunger
        const hungerDiff = this.healing.bestHunger - this.hunger;
        //your heascore(lower is better)
        const healScore = hungerDiff + tempDiff;
        //convert into persentage of the threshold
        const healscorePercentage = 1 - (healScore / this.healing.healThreshold)
        //health increace if you have a perfect healscore
        const maxHeal = 20;
        //change health
        this.health += (maxHeal * healscorePercentage) / this.ticksPerHour
        this.health = clamp(this.health, 0, 100);
        this.hunger = clamp(this.hunger, 0, 100);
        this.temp = clamp(this.temp, 0, 100);
        if (this.health == 0) {
            //die
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
        setcolor(color);
        borderRect(this.x, this.y, this.width, this.height);
        staticRect(this.x + 2, this.y + 2, (this.width * (fillLevel / 100)) - 4, this.height - 4);
    }
}
class tree {
    constructor(x, y) {
        //create branches
        this.branches = {
            x: [],
            y: [],
            size: [],
            innerXOffset: [],
            innerYOffset: [],
        };
        //add main tree part
        this.branches.x.push(x);
        this.branches.y.push(y);
        this.branches.size.push(random(75, 100));
        //add side brancehs
        this.branchNumber = random(0, 3) + 1;
        const mainSize = this.branches.size[0] / 2
        this.branches.innerYOffset.push(random(-8, 0));
        this.branches.innerXOffset.push(random(0, 8));
        for (let i = 1; i < this.branchNumber; i++) {
            this.branches.size.push(random(40, 50));
            const minDist = mainSize + (this.branches.size[i] / 2);
            if (random(1, 2) == 1) {
                if (random(1, 2)) {
                    this.branches.x.push(x - minDist - 12)
                } else {
                    this.branches.x.push(x + minDist + 12)
                }
                this.branches.y.push(y + random(-minDist, minDist));
            } else {
                if (random(1, 2)) {
                    this.branches.y.push(y - minDist - 12)
                } else {
                    this.branches.y.push(y + minDist + 12)
                }
                this.branches.x.push(x + random(-minDist, minDist));
            }
            this.branches.innerYOffset.push(random(-8, 0));
            this.branches.innerXOffset.push(random(0, 8));
        }
    }
    draw() {
        //draw shadow
        setcolor("rgba(12,46,32,0.5)");
        for (let i = 0; i < this.branches.x.length; i++) {
            rRect(this.branches.x[i], this.branches.y[i]+10, this.branches.size[i], this.branches.size[i], 10);
            line(this.branches.x[0], this.branches.y[0]+10, this.branches.x[i], this.branches.y[i]+10, 18);
        }
        setcolor("#4d2d14");
        //draw branches
        for (let i = 0; i < this.branches.x.length; i++) {
            line(this.branches.x[0], this.branches.y[0], this.branches.x[i], this.branches.y[i], 18);
        }
        setcolor("#08562e");
        //draw leaves outline
        for (let i = 0; i < this.branches.x.length; i++) {
            rRect(this.branches.x[i], this.branches.y[i], this.branches.size[i]+4, this.branches.size[i]+4, 10);
        }
        setcolor("#096e40");
        //draw leaves
        for (let i = 0; i < this.branches.x.length; i++) {
            rRect(this.branches.x[i], this.branches.y[i], this.branches.size[i], this.branches.size[i], 10);
        }
        setcolor("#1f7c43");

                //draw innerleaves
                for (let i = 0; i < this.branches.x.length; i++) {
                    rRect(this.branches.x[i]+this.branches.innerXOffset[i], this.branches.y[i]+this.branches.innerYOffset[i], this.branches.size[i]-20, this.branches.size[i]-20, 10);
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
        setcolor("green");
        circle(this.x, this.y, 50, 50);
    }
}
class backround {
    constructor(color) {
        //center location
        this.color = color;
        this.x = (gameSize.x / 2);
        this.y = (gameSize.y / 2);
    }
    draw() {
        setcolor(this.color);
        rect(this.x, this.y, gameSize.x, gameSize.y);
    }
}
class camera {
    constructor() {
        //center location
        this.x = (gameSize.x / 2);
        this.y = (gameSize.y / 2);
        this.xMomentum = 0;
        this.yMomentum = 0;
    }
    move(cameraSpeed, goalx, goaly) {
        this.xMomentum = (goalx - this.x) / cameraSpeed;
        this.yMomentum = (goaly - this.y) / cameraSpeed;
        this.x += this.xMomentum;
        this.y += this.yMomentum;
    }
}