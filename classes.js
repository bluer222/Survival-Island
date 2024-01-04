class player {
    constructor() {
        //center location
        this.x = (gameXSize / 2);
        this.y = (gameYSize / 2);
    }
    draw() {
        setcolor("tan");
        rect(this.x, this.y, 100, 100);
    }
    move(speed, movementx, movementy) {
        const distance = Math.sqrt(movementx * movementx + movementy * movementy);
        if (distance != 0) {
            const scaledXMovement = movementx / distance;
            const scaledYMovement = movementy / distance;
            this.x += scaledXMovement * speed; // Apply movement with adjusted speed
            this.y += scaledYMovement * speed;
        }
    }
}
class tree {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    draw() {
        setcolor("green");
        rect(this.x, this.y, 100, 100);
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
        rect(this.x, this.y, screenW, screenH);
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
        console.log(this.x);

    }
}