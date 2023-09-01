//based on https://www.youtube.com/watch?v=Rs_rAxEsAvI&t=982s

let car;
let img;
let road;
//let sens;
let traffic;
const friction = 0.02;
const numOfLanes = 5;
const startingLane = 1;
let startSim = false;
function setup() {
  createCanvas(500, windowHeight);

  road = new Road(width / 2, width * 0.9, numOfLanes);
  traffic = [
    new Car(
      road.getLaneCenter(startingLane),
      height - 200,
      0,
      road.getLaneWidth() * 0.6,
      "dummy"
    ),
  ];
  car = new Car(
    road.getLaneCenter(startingLane),
    height,
    0,
    road.getLaneWidth() * 0.6,
    "player"
  );
}
function draw() {
  background(100);
  if (keyIsDown(83)) {
    startSim = true;
  }
  main();
}
function main() {
  if (startSim) {
    var offsetX, offsetY; // Correct variable names
    [offsetX, offsetY] = centerCameraOnCar(car);
    push();
    translate(offsetX, offsetY + height * 0.3);
    road.show();
    for (let cars of traffic) {
      cars.update(road.borders,[]);
      cars.show();
    }
    car.update(road.borders,traffic);
    car.show();
    pop();
  }
}

function centerCameraOnCar(car, easing = 1) {
  let offsetX = 0; //- car.pos.x;
  let offsetY = height / 2 - car.pos.y;
  //offsetX = lerp(offsetX, width / 2 - car.pos.x, easing);
  offsetY = lerp(offsetY, height / 2 - car.pos.y, easing);

  return [offsetX, offsetY];
}
