//based on https://www.youtube.com/watch?v=Rs_rAxEsAvI&t=982s

let car;
let img;
let road;
let halfWidth;
//let sens;
let traffic;
const maxTraffic = 10;
const friction = 0.02;
const numOfLanes = 5;
const startingLane = Math.floor(numOfLanes / 2);
let startSim = false;
let lastSpawnDistance = 0;
let lastSpawnTime = 0;
const spawnDistanceInterval = 500;
let lastRandomlane = startingLane;
let spawned = false;
let nnv;
function setup() {
  createCanvas(1000, windowHeight);
  halfWidth = width / 2;
  frameRate(60);
  road = new Road(halfWidth / 2, halfWidth * 0.9, numOfLanes);
  car = new Car(
    road.getLaneCenter(startingLane),
    1000,
    0,
    road.getLaneWidth() * 0.6,
    1,
    "AI"
  ); //"player" instead of AI to control urself
  const randomLane = Math.floor(Math.random() * numOfLanes); // Random lane between 0 and numOfLanes-1
  const randomX = road.getLaneCenter(randomLane);
  const v = 0.5; //Math.random(0.2,0.5);
  traffic = [
    new Car(
      randomX,
      car.pos.y - height - 100, // Start traffic car above the screen
      0,
      road.getLaneWidth() * 0.6,
      v,
      "dummy"
    ),
  ];
  //nnv=new NNvisual(0,0,200,200,10,car.brain)
}

function draw() {
  background(100);
  if (keyIsDown(83)) {
    startSim = true;
  }
  main();
  fill(51);
  rect(halfWidth, 0, halfWidth, height);
  Visualizer.drawNetwork(halfWidth, height / 2, car.brain);
  //draw neaural network in the right half of the screen
  // drawNeuralNetwork(halfWidth*1.5,height/2,40,car.brain)
  //nnv.show()
}

function spawnTraffic() {
  if ((frameCount % 100) * frameRate() == 0) {
    spawned = false;
    console.log("reset spawned");
  }
  if (startSim && !spawned && car.isAlive && round(car.pos.y) % 1000 <= car.h) {
    const spawnProbability = 0.01; // Adjust this value to control spawn frequency
    if (Math.random() < spawnProbability) {
      const randomLane = Math.floor(Math.random() * numOfLanes); // Random lane between 0 and numOfLanes-1
      if (randomLane == lastRandomlane) {
        return;
      }
      const randomX = road.getLaneCenter(randomLane);
      lastRandomlane = randomLane;
      const v = 0.5; //Math.random(0.2,0.5);
      // Create a new car to be spawned
      const newTrafficCar = new Car(
        randomX,
        car.pos.y - height - 100, // Start traffic car above the screen
        0,
        road.getLaneWidth() * 0.6,
        v,
        "dummy"
      );

      // Check if the new car collides with any existing traffic cars or itself
      if (!newTrafficCar.checkCollisionTraffic([...traffic, newTrafficCar])) {
        traffic.push(newTrafficCar);
        spawned = true;
        console.log("Spawned traffic car in lane " + randomLane);
        if (traffic.length > maxTraffic) {
          // Remove the oldest car (first element) in the traffic array
          traffic.shift();
          console.log("Despawned the oldest traffic car");
        }
      }
    }
  }
  if (!car.isAlive) {
    for (let i = traffic.length - 1; i >= 0; i--) {
      if (Math.abs(traffic[i].pos.y - car.pos.y) > 1000) {
        traffic.splice(i, 1);
      }
    }
  }
}

function main() {
  if (startSim) {
    var offsetX, offsetY; // Correct variable names
    [offsetX, offsetY] = centerCameraOnCar(car);
    spawnTraffic();
    push();
    translate(offsetX, offsetY + height * 0.3);
    road.show();
    if (traffic.length > 0) {
      for (let cars of traffic) {
        cars.update(road.borders, []);
        cars.show();
      }
    }
    car.update(road.borders, traffic);
    car.show();
    pop();
  }
}

function centerCameraOnCar(car, easing = 1) {
  let offsetX = 0; //- car.pos.x;
  let offsetY = height / 2 - car.pos.y;
  //offsetX = lerp(offsetX, halfWidth / 2 - car.pos.x, easing);
  offsetY = lerp(offsetY, height / 2 - car.pos.y, easing);

  return [offsetX, offsetY];
}
