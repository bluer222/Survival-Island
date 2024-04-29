const worldZoom = 1;//zoom out the camera without rendering farther to test the chunk loading
//get canvas element
const canvas = document.getElementById("game");
const draw = canvas.getContext("2d");
//set canvas size
canvas.width = window.innerWidth*worldZoom;
canvas.height = window.innerHeight*worldZoom;
//set canvas size
canvas.style.width = window.innerWidth;
canvas.style.height = window.innerHeight;
//variables to store canvas size
var screenW = window.innerWidth;
var screenH = window.innerHeight;
//resize canvas when window is resized
addEventListener('resize', () => {
  //set new size
  canvas.width = window.innerWidth*worldZoom;
  canvas.height = window.innerHeight*worldZoom;
  //set canvas size
canvas.style.width = window.innerWidth;
canvas.style.height = window.innerHeight;
  //resets transforms
  draw.setTransform(1, 0, 0, 1, 0, 0);
  //update canvas size
  screenW = window.innerWidth;
  screenH = window.innerHeight;
});
function insideScreen(x, y, width, height) {
  //checks if a thing is on the screen(we dont need to render it if not)
  //this gains about 1 fps
  return (x > (-width) && x < (screenW) && y > (- height) && y < (screenH))
}
function distanceToPoint(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
}

function random(min, max) { //when you call the function put the minimum number, a comma, and the maximum number
  gameSeed = (gameSeed * 387420489 + 14348907) % 1e9;
  return Math.floor(getRandom(gameSeed) * (max - min + 1) + min);
}
function createArray(rows, columns) {
  let array = [];

  for (let i = 0; i < rows; i++) {
    array[i] = [];
    for (let j = 0; j < columns; j++) {
      array[i][j] = "";
    }
  }
  return array;
}
function isEven(n) {
  return n % 2 == 0;
}
//draws a rectangle
function rect(x, y, width, height) {
  //create gameoffset, this compensates for the screensize, the gamesize, and the object size, so its centered
  let gameXOffset = gameCamera.x - (screenW*worldZoom / 2);
  let gameYOffset = gameCamera.y - (screenH*worldZoom / 2);
  if (insideScreen(x-gameXOffset, y-gameYOffset, width, height)) {
  //draw it 
  draw.rect(x - gameXOffset, y - gameYOffset, width, height);
  }
}
//draws a rounded rectangle
function rRect(x, y, width, height, radius) {
  //create gameoffset, this compensates for the screensize, the gamesize, and the object size, so its centered
  let gameXOffset = gameCamera.x - (screenW*worldZoom / 2) + (width/2);
  let gameYOffset = gameCamera.y - (screenH*worldZoom / 2) + (height/2);
  if (insideScreen(x-gameXOffset, y-gameYOffset, width, height)) {
  //draw it 
  //draw.beginPath();
  draw.roundRect(x - gameXOffset, y - gameYOffset, width, height, radius);
 // draw.fill();
  }
}
//draws text
function drawText(text, x, y, maxWidth) {
  setcolor("black");
  draw.font = "20px arial";
  draw.fillText(text, x, y, maxWidth)
}
//draws a line
function line(x, y, x2, y2) {
  //create gameoffset, this compensates for the screensize, the gamesize, and the object size, so its centered
  let gameXOffset = gameCamera.x - (screenW*worldZoom / 2);
  let gameYOffset = gameCamera.y - (screenH*worldZoom / 2);
  if (insideScreen(x-gameXOffset, y-gameYOffset,   0, 0) || insideScreen(x2-gameXOffset, y2-gameYOffset,   0, 0)) {
  draw.moveTo(x - gameXOffset, y - gameYOffset);
  draw.lineTo(x2 - gameXOffset, y2 - gameYOffset);
  }
}
//makes a border for a recangle without offset
function borderRect(x, y, width, height) { //draws a border
  //create gameoffset, this compensates for the screensize(center of the screen is 0,0)
  let gameXOffset = gameCamera.x - (screenW*worldZoom / 2);
  let gameYOffset = gameCamera.y - (screenH*worldZoom / 2);
  if (insideScreen(x-gameXOffset, y-gameYOffset, width, height)) {
  //draw it 
  draw.rect(x - gameXOffset, y - gameYOffset, width, height);
  }

}
//makes a border for a recangle without offset
function stborderRect(x, y, width, height) { //draws a border
  //drawit
  draw.rect(x, y, width, height);

}

//draws a rectange without offset
function staticRect(x, y, width, height) {
  //draw it 
  draw.rect(x, y, width, height);
}
function setcolor(color) {
  draw.fillStyle = color;
  draw.strokeStyle = color;

}
//draws an elipse
function circle(x, y, width, height) {
  //create gameoffset, this compensates for the screensize, the gamesize, and the object size, so its centered
  let gameXOffset = gameCamera.x - (screenW*worldZoom / 2);
  let gameYOffset = gameCamera.y - (screenH*worldZoom / 2);
  //draw it 
  draw.ellipse(x - gameXOffset, y - gameYOffset, width / 2, height / 2, Math.PI, 0, 2 * Math.PI);
}
//if number is > max it becomse max, if number < min it becomes min
function clamp(number, min, max) {
  return Math.min(Math.max(number, min), max);
}
function constrainToExtremes(num, min, max) {
  if (num <= min || num >= max) {
    return num; // Stay the same if it is more extreme than the extremes
  } else {
    //if it is not more extreme, snap to the closest extreme
    const distanceToMin = Math.abs(num - min);
    const distanceToMax = Math.abs(num - max);
    return distanceToMin < distanceToMax ? min : max;
  }
}
function getRandom(seed) {
  seed ^= seed << 21;
  seed ^= seed >>> 35;
  seed ^= seed << 4;
  seed = BigInt(seed) * 2685821657736338717n;
  return Number((seed < 0 ? ~seed + 1n : seed) % BigInt(1e9)) / 1e9;
}
