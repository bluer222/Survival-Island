class player {
    constructor(hungerRate, tempRate) {
        //center location
        this.x = (gameSize.x / 2);
        this.y = (gameSize.y / 2);
        //hunger, 0=very hungry 100=full
        this.hunger = 100;
        //tempature, 100=on fire 0=frozen
        this.temp = 75;
        //health, 100=full 0=dead
        this.health = 100;
        //how much hunger goes down each clock hour
        this.hungerRate = hungerRate;
        //how much tempature goes down each clock hour
        this.tempRate = tempRate;
        this.ticksPerHour = 60*60;
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
        this.hunger -= (this.hungerRate / this.ticksPerHour);
        //decreace tempeture hunger
        this.temp -= (this.tempRate / this.ticksPerHour);
        //check if your going to die
        if(this.hunger == 0){
            this.health -= 10 / this.ticksPerHour;
        }
        if(this.temp == 0){
            this.health -= 10 / this.ticksPerHour;
        }
        if(this.temp == 100){
            this.health -= 10 / this.ticksPerHour;
        }
        if(this.temp > 60 && this.temp < 80 && this.hunger > 60 && this.health != 100)
        if(this.health == 0){
            //die
        }
    }

}
class bar{
    constructor(x, y, width, height) {
        //center location
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    draw(fillLevel, color){
        setcolor(color);
        borderRect(this.x, this.y, this.width, this.height);
        staticRect(this.x+2, this.y+2, (this.width*(fillLevel/100))-4, this.height-4);
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