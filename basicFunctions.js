//get canvas element
const canvas = document.getElementById("game");
const draw = canvas.getContext("2d");
//set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
//variables to store canvas size
var RWidth = canvas.width;
var RHeight = canvas.height;
//resize canvas when window is resized
addEventListener('resize', () => {
  //set new size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  //resets transforms
  draw.setTransform(1, 0, 0, 1, 0, 0);
  //update canvas size
  RWidth = canvas.width;
  RHeight = canvas.height;
});
function insideScreen(x, y, width, height) {
  //checks if its in the screen
  return (x > (-RWidth - width) && x < (RWidth + width) && y > (-RHeight - height) && y < (RHeight + height))
}
function distanceToPoint(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
}

function random(min, max) { //when you call the function put the minimum number, a comma, and the maximum number
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function isEven(n) {
  return n % 2 == 0;
}
//draws a rectangle
function rect(x, y, width, height) {
  //create gameoffset, this compensates for the screensize, the gamesize, and the object size, so its centered
  let gameXOffset = (gameXSize/2) - (RWidth/2) + (width/2);
  let gameYOffset = (gameYSize/2) - (RHeight/2) + (height/2);
  //is it on screen
  if (insideScreen(x-gameXOffset, y-gameYOffset, width, height)) {
    //draw it 
    draw.fillRect(x-gameXOffset, y-gameYOffset, width, height);
  }
}
function setcolor(color){
  draw.fillStyle = color;
}
//draws an elipse
function ellipse(x, y, width, height) {
  //create gameoffset, this compensates for the screensize, the gamesize, and the object size, so its centered
  let gameXOffset = (gameXSize/2) - (RWidth/2) + (width/2);
  let gameYOffset = (gameYSize/2) - (RHeight/2) + (height/2);
    //is it on screen
  if (insideScreen(x-gameXOffset, y-gameYOffset, width, height)) {
    //draw it 
    draw.beginPath();
    draw.ellipse(x-gameXOffset, y-gameYOffset, width, height, Math.PI, 0, 2 * Math.PI);
    draw.fill();
  }
}
//if number is > max it becomse max, if number < min it becomes min
function clamp(number, min, max) {
  return Math.min(Math.max(number, min), max);
}