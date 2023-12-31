class Car {
  constructor(x, y, ang, wid, speedfactor, type, i, brain, col) {
    if (i == undefined) i = 0;
    else {
      this.id = i;
    }
    this.braked = false;
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.w = wid;
    this.h = this.w * 1.6;
    if (col == undefined) {
      this.col = [random(360), 100, 100];
    } else {
      this.col = [col[0], col[1], col[2]];
    }
    //if (debug == undefined) debug = false;
    this.debug = false;
    this.speedfactor = speedfactor;
    this.angle = radians(ang);
    this.maxSpeed = 10;
    this.angularSpeed = radians(2);
    this.fov = PI / 2;
    this.flip = 1;
    this.type = type;
    this.maxForce = 0.2; // Maximum force for acceleration
    this.maxTurnForce = 0.1; // Maximum force for turning
    this.numOfSensors = 7;
    if (this.type != "dummy") {
      this.sensor = new Sensor(this, this.fov / 2, this.numOfSensors);
      //this.brain = new NeuralNetwork(this.numOfSensors, 6, 5);

      this.offsets = Array(this.numOfSensors).fill(0);
    }
    if (brain == undefined) {
      this.brain = new NeuralNetwork(neuralStructure); //for now only 3 layers
    } else {
      this.brain = brain;
    }
    this.useBrain = type == "AI" ? true : false;
    this.moving = false;
    this.polygon = this.createPolygon();
    this.left = -this.w / 2;
    this.right = this.w / 2;
    this.top = -this.h / 2;
    this.bottom = this.h / 2;
    const topLeft = { x: this.left, y: this.top };
    const topRight = { x: this.right, y: this.top };
    const bottomLeft = { x: this.left, y: this.bottom };
    const bottomRight = { x: this.right, y: this.bottom };
    this.borders = [
      [topLeft, topRight],
      [topRight, bottomRight],
      [bottomRight, bottomLeft],
      [bottomLeft, topLeft],
    ];
    this.controls = new Controls();
    this.collided = false;
    this.collisionwithRoad = false;
    this.collisionwithTraffic = false;
    this.isAlive = true;
    this.spawnTime = millis();
    this.decisions = [];
    this.fitness = 0;
  }
  createPolygon() {
    const halfWidth = this.w / 2;
    const halfHeight = this.h / 2;

    // Calculate the four corner points of the car
    const topLeft = createVector(-halfWidth, -halfHeight);
    const topRight = createVector(halfWidth, -halfHeight);
    const bottomLeft = createVector(-halfWidth, halfHeight);
    const bottomRight = createVector(halfWidth, halfHeight);

    // Apply translation and rotation transformations
    const cosA = cos(this.angle);
    const sinA = sin(this.angle);

    const translatedTopLeft = createVector(
      topLeft.x * cosA - topLeft.y * sinA + this.pos.x,
      topLeft.x * sinA + topLeft.y * cosA + this.pos.y
    );

    const translatedTopRight = createVector(
      topRight.x * cosA - topRight.y * sinA + this.pos.x,
      topRight.x * sinA + topRight.y * cosA + this.pos.y
    );

    const translatedBottomLeft = createVector(
      bottomLeft.x * cosA - bottomLeft.y * sinA + this.pos.x,
      bottomLeft.x * sinA + bottomLeft.y * cosA + this.pos.y
    );

    const translatedBottomRight = createVector(
      bottomRight.x * cosA - bottomRight.y * sinA + this.pos.x,
      bottomRight.x * sinA + bottomRight.y * cosA + this.pos.y
    );

    // Return the transformed corner points
    return [
      translatedTopLeft,
      translatedTopRight,
      translatedBottomRight,
      translatedBottomLeft,
    ];
  }
  show() {
    push();
    colorMode(HSB);
    rectMode(CENTER);
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);

    // Draw the car
    fill(0, 0, 0);
    stroke("white");
    rect(this.w / 2, this.h / 3.5, this.w / 5, this.h / 5, this.h / 25);
    rect(-this.w / 2, this.h / 3.5, this.w / 5, this.h / 5, this.h / 25);
    rect(this.w / 2, -this.h / 5, this.w / 5, this.h / 5, this.h / 25);
    rect(-this.w / 2, -this.h / 5, this.w / 5, this.h / 5, this.h / 25);
    fill(this.col[0], this.col[1], this.col[2], this.collided ? 50 : 255);
    stroke("black");
    rect(0, 0, this.w, this.h, this.w / 3, this.w / 3, 5, 5);
    fill(0, 0, 0);
    textSize(this.w / 3);
    textAlign(CENTER, CENTER);
    text(nf(this.fitness, 0, 4), 0, 0);
    if (this.debug || this.type == "dummy") {
      // Draw the speedometer
      let speed = this.vel.mag();
      let speedAngle = map(speed, 0, this.maxSpeed, -PI / 4, PI / 4);
      let gaugeRadius = this.w / 1.5;

      // Draw the speedometer arc
      fill(0, 0, 100);
      stroke(0);
      arc(
        0,
        this.h * 0.5,
        gaugeRadius * 2,
        gaugeRadius * 2,
        -(3 * PI) / 4,
        -PI / 4,
        PIE
      );

      // Draw the speedometer needle
      push();
      translate(0, this.h * 0.5);
      rotate(speedAngle - PI / 2);
      strokeWeight(2);
      line(0, 0, gaugeRadius * 0.9, 0);
      pop();

      // Draw the speedometer text
      textAlign(CENTER, CENTER);
      textSize(14);
      fill(0);
      text("Speed", 0, this.h / 2 + 10);
      textSize(20);
      text(nf(this.vel.mag() * 10, 0, 2) + " pix/sec", 0, this.h / 2 + 30);
      //push();
      //translate(this.pos.x, this.pos.y);

      //pop();
    }

    pop();
    if (this.debug) {
      this.showCollisionBox();
      if (this.type != "dummy") {
        this.sensor.show();
      }
    }

    // for (let p of this.polygon) {
    //   ellipse(p.x, p.y, 10, 10);
    // }
  }

  isFacingUp() {
    return (
      (this.angle < PI / 2 && this.angle >= 0) ||
      (this.angle > 1.5 * PI && this.angle <= 2 * PI)
    );
  }

  isFacingDown() {
    return this.angle > PI / 2 && this.angle < 1.5 * PI;
  }

  isFacingRight() {
    return this.angle > 0 && this.angle < PI;
  }

  isFacingLeft() {
    return !this.isFacingRight() && this.angle != 0;
  }

  update(roadBorders, traffic) {
    if (this.type == "dummy") {
      if (startSim) {
        const directionX = sin(this.angle);
        const directionY = cos(this.angle);
        this.flip = 1;
        this.acc.add(
          createVector(directionX, -directionY).mult(this.maxForce * 0.5)
        );
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed * this.speedfactor);
        this.pos.add(this.vel);
        this.vel.mult(1 - friction);
        if (this.angle < 0) this.angle += 2 * PI;
        if (this.angle > 2 * PI) this.angle -= 2 * PI;
        //this.sensor.update(roadBorders);
        this.polygon = this.createPolygon();
        if (this.vel.mag() > 0) return;
      }
    } else {
      this.collided = false;
      if (!this.isAlive) {
        this.sensor.update(roadBorders, traffic);
        return;
      }
      //this.oldmove()
      //this.move();
      //this.debug=false;
      this.sensor.update(roadBorders, traffic);
      for (let i = 0; i < this.sensor.distances.length; i++)
        this.offsets[i] = 1 - this.sensor.distances[i];
      //let a = map(abs(this.vel.y), 0, this.maxSpeed, 0, 1);
      //console.log(a)
      //this.offsets[this.offsets.length - 1] = a;
      //console.log(this.offsets[this.offsets.length-1])

      //console.log(this.offsets);
      //const output=this.brain.feedForward(this.offsets);
      this.decisions = NeuralNetwork.feedForward(this.offsets, this.brain);
      //console.log(this.decisions);
      this.AImove(this.decisions);

      //console.log(outputs);
      this.polygon = this.createPolygon();
      this.wrapAroundCanvas();
      if (this.checkCollisionTraffic(traffic)) {
        this.isAlive = false;
        this.collided = true;
        //console.log("collided with traffic");
        this.vel.mult(0);
      }
      if (this.checkCollisionRoad(roadBorders)) {
        this.isAlive = false;
        this.collided = true;
        //console.log("collided");
        this.vel.mult(0);
      }
    }
    this.calculateFitness();
    //console.log(this.fitness)

    // console.log(this.sensor.roadDistances, this.sensor.trafficDistances);
    //console.log(this.sensor.distances);
  }
  setPos(x, y) {
    this.pos.x = x;
    this.pos.y = y;
  }
  calculateFitness() {
    //make fitness grow linear with y at first untill fitness <0.2 then make it exponential
    if (this.isAlive) {
      if (this.moving && this.vel.mag() > this.maxSpeed * 0.5) {
        this.fitness += 0.0001;
      } else {
        this.fitness -= 0.0005;
      }

      if (this.fitness > 0.1) {
        this.fitness *= 1.0001;
      }
      // if(this.vel.mag()<0.6*this.maxSpeed && this.vel.mag()>0.4* this.maxSpeed){
      //   this.fitness-=0.1;
      // }

      //constrain the fitness between 0 to 1
    }
    if (this.collided) {
      this.fitness /= 1;
    }
    this.fitness = constrain(this.fitness, 0, 1);
  }

  AImove(decision) {
    this.acc.set(0, 0);
    if (this.vel.mag() < 0.1) {
      this.vel.set(0, 0);
      this.moving = false;
    } else {
      this.moving = true;
    }

    //for sigmoid activision function
    if (decision[0] > 0.5) {
      this.angle -= this.angularSpeed * this.flip;
      if (this.angle < 0) this.angle += 2 * PI;
    }

    if (decision[1] > 0.5) {
      this.angle += this.angularSpeed * this.flip;
      if (this.angle > 2 * PI) this.angle -= 2 * PI;
    }
    
//for step activision function
    // if (decision[0]==1) {
    //   // 0.5 && decision[1] < 0.5) {
    //   this.angle -= this.angularSpeed * this.flip;
    //   if (this.angle < 0) this.angle += 2 * PI;
    // }

    // if (decision[1] == 1) {
    //   // && decision[0] < 0.5) {
    //   this.angle += this.angularSpeed * this.flip;
    //   if (this.angle > 2 * PI) this.angle -= 2 * PI;
    // }
    // if (decision[2] == 1) {
    //   this.vel.mult(0.9);
    //   this.braked = true;
    // } else {
    //   this.braked = false;
    // }

    //5 outputs 0,1,2,3,4
    const directionX = sin(this.angle);
    const directionY = cos(this.angle);
    //forward
    if (true) {
    //if (decision[2] == 1) {
      this.flip = 1;
      this.acc.add(createVector(directionX, -directionY).mult(this.maxForce));
    }

    if (false) {
      const reverseAcc = createVector(-directionX, directionY).mult(
        this.maxForce * 0.75
      );
      this.flip = -1;
      this.acc.add(reverseAcc);
    }

    // if(decision[4]==1){
    //   this.vel.mult(0.9);
    // }

    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed * this.speedfactor);
    this.pos.add(this.vel);
    this.vel.mult(1 - friction);
  }

  move() {
    this.acc.set(0, 0);
    if (this.vel.mag() < 0.1) {
      this.vel.set(0, 0);
      this.moving = false;
    } else {
      this.moving = true;
    }

    if (this.controls.left) {
      this.angle -= this.angularSpeed * this.flip;
      if (this.angle < 0) this.angle += 2 * PI;
    }

    if (this.controls.right) {
      this.angle += this.angularSpeed * this.flip;
      if (this.angle > 2 * PI) this.angle -= 2 * PI;
    }

    const directionX = sin(this.angle);
    const directionY = cos(this.angle);

    if (this.controls.forward) {
      this.flip = 1;
      this.acc.add(createVector(directionX, -directionY).mult(this.maxForce));
    }

    if (this.controls.backward) {
      const reverseAcc = createVector(-directionX, directionY).mult(
        this.maxForce * 0.75
      );
      this.flip = -1;
      this.acc.add(reverseAcc);
    }
    if (this.controls.brake) {
      this.vel.mult(0.9);
    }
    console.log(this.controls);
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed * this.speedfactor);
    this.pos.add(this.vel);
    this.vel.mult(1 - friction);
  }

  oldmove() {
    this.acc.set(0, 0);
    if (this.vel.mag() < 0.1) {
      this.vel.set(0, 0);
      this.moving = false;
    } else {
      this.moving = true;
    }
    console.log(this.moving);

    if (keyIsDown(LEFT_ARROW)) {
      this.angle -= this.angularSpeed * this.flip;
      if (this.angle < 0) this.angle += 2 * PI;
    }

    if (keyIsDown(RIGHT_ARROW)) {
      this.angle += this.angularSpeed * this.flip;
      if (this.angle > 2 * PI) this.angle -= 2 * PI;
    }

    const directionX = sin(this.angle);
    const directionY = cos(this.angle);

    if (keyIsDown(UP_ARROW)) {
      this.flip = 1;
      this.acc.add(createVector(directionX, -directionY).mult(this.maxForce));
    }

    if (keyIsDown(DOWN_ARROW)) {
      const reverseAcc = createVector(-directionX, directionY).mult(
        this.maxForce * 0.75
      );
      this.flip = -1;
      this.acc.add(reverseAcc);
    }
    if (keyIsDown(32)) {
      this.vel.mult(0.9);
    }
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.vel.mult(1 - friction);
  }

  wrapAroundCanvas() {
    if (this.pos.x + this.w / 2 < 0) {
      this.pos.x = halfWidth + this.w / 2;
    } else if (this.pos.x - this.w / 2 > halfWidth) {
      this.pos.x = -this.w / 2;
    }

    // if (this.pos.y + this.h / 2 < 0) {
    //   this.pos.y = height + this.h / 2;
    // } else if (this.pos.y - this.h / 2 > height) {
    //   this.pos.y = -this.h / 2;
    // }
  }
  checkCollisionTraffic(traffic) {
    for (let car of traffic) {
      if (car != this) {
        if (this.checkCollision(car)) {
          return true;
        }
      }
    }
    return false;
  }
  checkCollision(car) {
    for (let p of this.polygon) {
      if (car.isPointInside(p)) {
        return true;
      }
    }
    for (let p of car.polygon) {
      if (this.isPointInside(p)) {
        return true;
      }
    }
    return false;
  }
  isPointInside(point) {
    let collision = false;
    let next = 0;
    for (let current = 0; current < this.polygon.length; current++) {
      next = current + 1;
      if (next == this.polygon.length) {
        next = 0;
      }
      let vc = this.polygon[current];
      let vn = this.polygon[next];
      if (
        ((vc.y >= point.y && vn.y < point.y) ||
          (vc.y < point.y && vn.y >= point.y)) &&
        point.x < ((vn.x - vc.x) * (point.y - vc.y)) / (vn.y - vc.y) + vc.x
      ) {
        collision = !collision;
      }
    }
    return collision;
  }
  showPoints() {
    push();
    strokeWeight(2);
    stroke("red");
    fill(0, 0, 0, 0);
    beginShape();
    for (let p of this.polygon) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);
    pop();
  }

  checkCollisionRoad(roadBorders) {
    for (let border of roadBorders) {
      for (let i = 0; i < this.polygon.length; i++) {
        const nextIndex = (i + 1) % this.polygon.length;
        const pt1 = this.polygon[i];
        const pt2 = this.polygon[nextIndex];

        const intersection = checkLineToLineIntersection(
          pt1.x,
          pt1.y,
          pt2.x,
          pt2.y,
          border[0].x,
          border[0].y,
          border[1].x,
          border[1].y
        );

        if (intersection) {
          return true; // Collision detected
        }
      }
    }

    return false; // No collision
  }

  isCarinLane(lane) {
    const laneCenter = road.getLaneCenter(lane);
    const laneWidth = road.getLaneWidth();
    if (
      this.pos.x > laneCenter - laneWidth / 2 &&
      this.pos.x < laneCenter + laneWidth / 2
    ) {
      return true;
    }
    return false;
  }
  showCollisionBox() {
    push();
    strokeWeight(2);
    stroke("red");
    fill(0, 0, 0, 0);
    beginShape();
    for (let p of this.polygon) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);
    pop();
  }

  mutate() {
    //console.log(this.brain);
    this.brain.mutate(0.08);
  }
  static crossover(parent1, parent2) {
    let child = new Car(
      road.getLaneCenter(startingLane),
      0,
      0,
      road.getLaneWidth() * 0.6,
      1,
      "AI",
      floor((parent1.id + parent2.id) / 2),
      NeuralNetwork.crossOver(
        parent1.brain,
        parent2.brain,
        parent1.fitness,
        parent2.fitness
      ),
      random(1) > 0.5
        ? [parent1.col[0], parent1.col[1], parent1.col[2]]
        : [parent2.col[0], parent2.col[1], parent2.col[2]]
    );
    return child;
  }

  // crossOver(partner){
  //   let child=new Car(this.pos.x,this.pos.y,0,this.w,this.speedfactor,this.type,this.debug,this.col);
  //   child.brain=NeuralNetwork.crossOver(this.brain,partner.brain);
  //   return child;
  // }
}
