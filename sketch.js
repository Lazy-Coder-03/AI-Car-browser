//based on https://www.youtube.com/watch?v=Rs_rAxEsAvI&t=982s

let car;
let img;
let road;
//let sens;
const friction=0.01;
const numOfLanes=3;
const startingLane=1
function preload(){
  img=loadImage("assets/car.png")
}
function setup() {
  createCanvas(500, windowHeight);
  //let color=[0,100,100]
 // img=loadImage("assets/car.png")
  //c1 = new Car(100, 100, 30, 30 * 1.6);
  road=new Road(width/2,width*0.9,numOfLanes)
  car = new Car(road.getLaneCenter(startingLane),height,0,road.getLaneWidth()*0.6)
 // sens=new Sensor(car,road)

}
function draw() {
  background(100);
  var offsetX, offsetY; // Correct variable names
  [offsetX, offsetY] = centerCameraOnCar(car);
  push();
  translate(offsetX, offsetY+height*0.3);
  road.show();
  car.update(road.borders);
  car.show();
  pop();
}
function centerCameraOnCar(car, easing=1) {
  let offsetX = 0 //- car.pos.x;
  let offsetY = height / 2 - car.pos.y;
  //offsetX = lerp(offsetX, width / 2 - car.pos.x, easing);
  offsetY = lerp(offsetY, height / 2 - car.pos.y, easing);

  return [offsetX, offsetY];
}