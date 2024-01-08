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



        /*
//check if your going to die
if(this.hunger < this.survival.hungerThreshold){
//the more hungry you are, the higher the hunger damage will be
const hungerDamage = (this.survival.hungerThreshold-this.hunger);
this.health -= hungerDamage / this.ticksPerHour;
}
if(this.temp < this.survival.hungerThreshold){
const tempDamage = (this.survival.hungerThreshold-this.hunger);
this.health -= tempDamage / this.ticksPerHour;
}
if(this.temp == 100){
this.health -= 10 / this.ticksPerHour;
}
//if the you might be eligable for healing
if(this.temp > 50 && this.temp < 80 && this.hunger > 50 && this.health != 100){
//worst healscore witin requirements
const worstHealScore = (this.survival.bestTemp-50) + (this.survival.bestHunger-50);
//difference between optimal and current temp
const tempDiff = Math.abs(this.survival.bestTemp-this.temp);
            //difference between optimal and current hunger
const hungerDiff = this.survival.bestHunger-this.hunger;
const healScore = hungerDiff + tempDiff;
//calculate how close it is between 0 and worst(closer to 0 is better)
const healscorePercentage = 1-(healScore/worstHealScore)
//health increace if you have a perfect healscore
const maxHealAmmount = 20;
//increace health
this.health += maxHealAmmount*healscorePercentage
}*/
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
        this.x = x;
        this.y = y;
    }
    draw() {
        setcolor("green");
        rect(this.x, this.y, 50, 50);
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