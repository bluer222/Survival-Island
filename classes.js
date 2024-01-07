class player {
    constructor(hungerRate, tempRate) {
        //center location
        this.x = (gameXSize / 2);
        this.y = (gameYSize / 2);
        //hunger, 0=very hungry 100=full
        this.hunger = 100;
        //tempature, 100=on fire 0=frozen
        this.temp = 75;
        //how much hunger goes down each clock hour
        this.hungerRate = hungerRate;
        //how much tempature goes down each clock hour
        this.tempRate = tempRate;
    }
    draw() {
        setcolor("tan");
        circle(this.x, this.y, 50, 50);
    }
    move(speed, movementx, movementy) {
        this.x += movementx * speed; // Apply movement with adjusted speed
        this.y += movementy * speed;
    }
    clockSurvival() {
        //check if your going to die

    }
    tickSurvival() {
        //increase hunger
        this.hunger -= (this.hungerRate / 3600);
        //decreace tempeture hunger
        this.temp -= (this.tempRate / 3600);
    }

}
class bar{
    constructor(x, y, color, length, width) {
        //center location
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }
    draw(fillLevel){
        staticRect(this.x, this.y, this.width, this.height);
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
        this.x = (gameXSize / 2);
        this.y = (gameYSize / 2);
    }
    draw() {
        setcolor(this.color);
        rect(this.x, this.y, gameXSize, gameYSize);
    }
}
class camera {
    constructor() {
        //center location
        this.x = (gameXSize / 2);
        this.y = (gameYSize / 2);
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