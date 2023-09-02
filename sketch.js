//based on https://www.youtube.com/watch?v=Rs_rAxEsAvI&t=982s

let car;
let img;
let road;
//let sens;
let traffic;
const maxTraffic = 10;
const friction = 0.02;
const numOfLanes = 5;
const startingLane = 1;
let startSim = false;
let lastSpawnDistance = 0;
let lastSpawnTime = 0;
const spawnDistanceInterval = 500;
function setup() {
  createCanvas(500, windowHeight);

  road = new Road(width / 2, width * 0.9, numOfLanes);
  car = new Car(
    road.getLaneCenter(startingLane),
    1000,
    0,
    road.getLaneWidth() * 0.6,
    "player"
  );
  const randomLane = Math.floor(Math.random() * numOfLanes); // Random lane between 0 and numOfLanes-1
  const randomX = road.getLaneCenter(randomLane);
  traffic = [
    new Car(
      randomX,
      car.pos.y - height - 100, // Start traffic car above the screen
      0,
      road.getLaneWidth() * 0.6,
      "dummy"
    ),
  ];
}

function draw() {
  background(100);
  if (keyIsDown(83)) {
    startSim = true;
  }
  console.log(car.pos.y);

    // Despawn traffic cars that are out of the screen for more than 10 seconds
    const currentTime = millis();
    for (let i = traffic.length - 1; i >= 0; i--) {
      const trafficCar = traffic[i];
      // Calculate the absolute position of the traffic car
      const absoluteTrafficPosY =
        trafficCar.pos.y - (height / 2 - trafficCar.pos.y);
      if (
        absoluteTrafficPosY > height + 100 &&
        currentTime - trafficCar.spawnTime > 10000
      ) {
        traffic.splice(i, 1); // Remove the traffic car from the array
      }
    }
    main();
}
function spawnTraffic() {
  if (startSim && car.moving && (round(car.pos.y)) % 1000 <= car.h) {
    const spawnProbability = 0.01; // Adjust this value to control spawn frequency
    if (Math.random() < spawnProbability) {
      const randomLane = Math.floor(Math.random() * numOfLanes); // Random lane between 0 and numOfLanes-1
      const randomX = road.getLaneCenter(randomLane);
      
      // Create a new car to be spawned
      const newTrafficCar = new Car(
        randomX,
        car.pos.y - height - 100, // Start traffic car above the screen
        0,
        road.getLaneWidth() * 0.6,
        "dummy"
      );

      // Check if the new car collides with any existing traffic cars or itself
      if (!newTrafficCar.checkCollisionTraffic([...traffic, newTrafficCar])) {
        traffic.push(newTrafficCar);
        console.log("Spawned traffic car in lane " + randomLane);
        if (traffic.length > maxTraffic) {
          // Remove the oldest car (first element) in the traffic array
          traffic.shift();
          console.log("Despawned the oldest traffic car");
        }
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
    for (let cars of traffic) {
      cars.update(road.borders, []);
      cars.show();
    }
    car.update(road.borders, traffic);
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
