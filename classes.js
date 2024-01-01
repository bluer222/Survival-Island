class player{
    constructor(gameXSize, gameYSize) {
        console.log(gameXSize);
        //center location
        this.x = (gameXSize / 2) + RWidth/2; 
        this.y = (gameYSize / 2) + RHeight/2;
    }
    move(){
        
    }
    draw(){
        setcolor("tan");
        rect(this.x, this.y, 100, 100);
    }
}
