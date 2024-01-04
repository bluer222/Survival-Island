class player{
    constructor() {
        //center location
        this.x = (gameXSize / 2); 
        this.y = (gameYSize / 2);
    }
    draw(){
        setcolor("tan");
        rect(this.x, this.y, 100, 100);
    }
}
