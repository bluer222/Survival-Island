//get canvas element
const canvas = document.getElementById("game");
const draw = canvas.getContext("2d");
//variables to store canvas size
var RW = canvas.width;
var RH = canvas.height;
//set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
//resize canvas when window is resized
addEventListener('resize', () => {
  //set new size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  //resets transforms
  draw.setTransform(1, 0, 0, 1, 0, 0);
  //update canvas size
  RW = canvas.width;
  RH = canvas.height;
});
function insideScreen(x, y, width, height) {
  //checks if its in the screen
  return (x > (-RW - width) && x < (RW + width) && y > (-RH - height) && y < (RH + height))
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
  //is it on screen
  if (insideScreen(x, y, width, height)) {
    //draw it 
    draw.fillRect(x, y, width, height);
  }
}
function setcolor(color){
  draw.fillStyle = color;
}
//draws an elipse
function ellipse(x, y, width, height) {
  //is it on screen
  if (insideScreen(x, y, width, height)) {
    //draw it 
    draw.beginPath();
    draw.ellipse(x, y, width, height, Math.PI, 0, 2 * Math.PI);
    draw.fill();
  }
}