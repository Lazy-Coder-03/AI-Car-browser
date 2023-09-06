//based on https://www.youtube.com/watch?v=Rs_rAxEsAvI&t=982s

let car;
let img;
let road;
let halfWidth;
//let sens;
let traffic;
const maxTraffic = 10;
const friction = 0.02;
const numOfLanes = 3;
const startingLane = Math.floor(numOfLanes / 2);
let startSim = false;
let lastSpawnDistance = 0;
let lastSpawnTime = 0;
const spawnDistanceInterval = 500;
let lastRandomlane = startingLane;
let spawned = false;
let nnv;
const trafficSpawnProbability = 0.1;
let cars = [];
let prevCars = [];
let bestCar;
let onlyShowBest = true;
const populationSize = 5000;
let gen = 0;
let neuralStructure = [7, 10, 2];
function setup() {
  const canvasContainer = document.getElementById("canvas-container");
  const canvasWidth = 800; // Set your desired canvas width

  // Calculate the horizontal margin to center the canvas
  const horizontalMargin = (windowWidth - canvasWidth) / 2;

  // Create the canvas and position it
  const cnv = createCanvas(canvasWidth, windowHeight);
  cnv.parent("canvas-container"); // Set the parent to the container div
  cnv.position(horizontalMargin, 0);
  frameRate(60);
  halfWidth = width / 2;
  road = new Road(halfWidth / 2, halfWidth * 0.9, numOfLanes);
  cars = generateCar(populationSize);
  bestCar = cars[0];
  console.log(bestCar.isCarinLane(0));
  console.log(bestCar.isCarinLane(1));
  console.log(bestCar.isCarinLane(2));
  // car = new Car(
  //   road.getLaneCenter(startingLane),
  //   1000,
  //   0,
  //   road.getLaneWidth() * 0.6,
  //   1,
  //   "AI"
  // ); //"player" instead of AI to control urself
  const randomLane = Math.floor(Math.random() * numOfLanes); // Random lane between 0 and numOfLanes-1
  const randomX = road.getLaneCenter(startingLane);
  const v = 0.5; //Math.random(0.2,0.5);
  //console.log(cars)
  let carposy = bestCar.pos.y;
  traffic = [
    new Car(
      randomX,
      carposy - 200, // Start traffic car above the screen
      0,
      road.getLaneWidth() * 0.6,
      v,
      "dummy",
      0
    ),
  ];
  //nnv=new NNvisual(0,0,200,200,10,car.brain)
}

function getBestCar(cars) {
  let bestCar = cars[0];
  for (let i = 1; i < cars.length; i++) {
    if (cars[i].fitness > bestCar.fitness) {
      bestCar = cars[i];
    }
  }
 // console.log(bestCar);
  return bestCar;
}

function windowResized() {
  // Recalculate and reposition the canvas if the window is resized
  const horizontalMargin = (windowWidth - width) / 2;
  resizeCanvas(1000, windowHeight);
  //canvas.position(horizontalMargin, 0);
}

function draw() {
  background(100);
  if (keyIsDown(83)) {
    startSim = true;
  }
  fill(0);
  rect(halfWidth, 0, halfWidth, height);
  //let c = getBestCar(cars);
  //if (c) {
  //  console.log(c.fitness);
  //}
  main();
  let c = getBestCar(cars);
  if (cars.length == 0 || c.fitness > 0.99) {
    gen++;
    cars = startNewGeneration(prevCars);
    prevCars = [];
    console.log("new generation " + gen + " started");
  }

  //bestCar=cars.find(c=>c.y==Math.min(...cars.map(c=>c.y)))
  //console.log(cars)
}

function main() {
  if (startSim) {
    var offsetX, offsetY; // Correct variable names
    bestCar = getBestCar(cars);
    //console.log(bestCar);
    if (bestCar) {
      [offsetX, offsetY] = centerCameraOnCar(bestCar);
      spawnTraffic(bestCar);
      bestCar.debug = true;
      // console.log(bestCar.debug);
      visNetwork.drawNetwork(
        bestCar.brain,
        halfWidth,
        50,
        width / 2,
        height - 100
      );
    }

    push();
    translate(offsetX, offsetY + height * 0.3);
    road.show();

    for (car of cars) {
      if (car.isAlive && car.isFacingUp()) {
        car.update(road.borders, traffic);
        if (onlyShowBest) {
          if (car == bestCar) {
            car.show();
          }
        } else {
          car.show();
        }
      } else {
        const removedCar = cars.splice(cars.indexOf(car), 1)[0];
        prevCars.push(removedCar);
        //console.log(cars.length, prevCars.length);
      }
    }
    if (traffic.length > 0) {
      for (let cars of traffic) {
        cars.update(road.borders, []);
        cars.show();
      }
    }

    pop();
  }
}

function generateCar(n) {
  const cars = [];
  for (let i = 0; i < n; i++) {
    cars.push(
      new Car(
        road.getLaneCenter(startingLane),
        100000,
        0,
        road.getLaneWidth() * 0.6,
        1,
        "AI",
        i
      )
    );
  }
  return cars;
}

function spawnTraffic(targetcar) {
  let carposy = targetcar.pos.y;
  //console.log(targetcar)
  if ((frameCount % 30) == 0) {
    spawned = false;
    console.log("reset spawned");
  }
  let spawnfact=100
  if (startSim && !spawned && round(carposy) % 1000 <= spawnfact) {
    //const spawnProbability = 0.05; // Adjust this value to control spawn frequency
    if (Math.random() < trafficSpawnProbability) {
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
        carposy - height - 100, // Start traffic car above the screen
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
  // if (!car.isAlive) {
  //   for (let i = traffic.length - 1; i >= 0; i--) {
  //     if (Math.abs(traffic[i].pos.y - car.pos.y) > 1000) {
  //       traffic.splice(i, 1);
  //     }
  //   }
  // }
}

function centerCameraOnCar(car, easing = 1) {
  let offsetX = 0; //- car.pos.x;
  let offsetY = height / 2 - car.pos.y;
  //offsetX = lerp(offsetX, halfWidth / 2 - car.pos.x, easing);
  offsetY = lerp(offsetY, height / 2 - car.pos.y, easing);

  return [offsetX, offsetY];
}

function generateRandomCar() {
  //const randomLane = Math.floor(Math.random() * numOfLanes);
  const randomX = road.getLaneCenter(startingLane);
  const v = 1; // Adjust this as needed
  const randomID = floor((populationSize+1)*Math.random()); // You can set a unique ID here
  console.log("random car with id "+randomID+" was generated");
  // Create a new car with random properties
  const randomCar = new Car(
    randomX,
    100000,
    0,
    road.getLaneWidth() * 0.6,
    v,
    "AI",
    randomID
  );

  // Optionally mutate the random car's brain if needed
  //randomCar.brain.mutate(0.3);

  return randomCar;
}

function startNewGeneration(oldcars) {
  let newcars = [];
  let bestCar = getBestCar(oldcars);
  console.log(bestCar);
  newcars[0] = bestCar;
  bestCar.setPos(road.getLaneCenter(startingLane), 100000); //.setPos(road.getLaneCenter(startingLane),100000)
  console.log(bestCar.fitness);
  bestCar.fitness = 0;
  // Generate a single traffic car by default
  traffic = [
    new Car(
      road.getLaneCenter(startingLane),
      100000-200,
      0,
      road.getLaneWidth() * 0.6,
      0.5,
      "dummy",
      0
    )  
  ];
  //generateCar(1);
  // for(let i=1;i<11;i++){
  //   newcars.push(generateRandomCar());
  // }
  for (let i = 1; i < populationSize; i++) {
    let car = pickOne(oldcars);
    //let p2 = pickOne(oldcars);
    //console.log(p1.id, p2.id);
    //let child = Car.crossover(p1, p2);
    let child = new Car(
      road.getLaneCenter(startingLane),
      100000,
      0,
      road.getLaneWidth() * 0.6,
      1,
      "AI",
      i,
      car.brain,
      car.col
    );
    child.brain.mutate(0.01);
    newcars.push(child);
  }

  return newcars;
}

function pickOne(cars) {
  let index = 0;
  //let sortedCars = [...cars];
  //sort the cars array from highest fitness to lowest
  cars.sort((a, b) => b.fitness - a.fitness);
  let r = random(1);
  while (r > 0 && index < cars.length) {
    // console.log(cars[index].fitness)
    r = r - cars[index].fitness;
    index++;
  }
  index--;
  // let child = new Car(
  //   road.getLaneCenter(startingLane),
  //   0,
  //   0,
  //   road.getLaneWidth() * 0.6,
  //   1,
  //   "AI",
  //   index,
  //   car.brain,
  //   car.col
  // );
  // // child.brain = car.brain;
  // child.mutate();

  return cars[index];
}

// function pickOne(cars) {
//   let ind=0;
//   //sort in deceasing order of car fitness so that the first car has the highest fitness
//   cars.sort((a, b) => b.fitness - a.fitness);
//   let r = random(0.02);
//   for(let i=0;i<cars.length;i++){
//     if(r<cars[i].fitness){
//       ind=i;
//       break;
//     }
//   }
//   return cars[ind];

// let r = random(1);
// //make it so it is more likely cars are picked with higher fitness
// while (r > 0 && ind < cars.length) {
//   r = r - cars[ind].fitness;
//   ind++;
// }
// ind--;
// return cars[ind];
