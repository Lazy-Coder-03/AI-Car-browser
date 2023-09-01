class Car {
  constructor(x, y, ang, wid, col) {
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
    this.angle = radians(ang);
    this.maxSpeed = 10;
    this.angularSpeed = radians(2);
    this.fov = PI / 2;
    this.flip = 1;
    this.maxForce = 0.2; // Maximum force for acceleration
    this.maxTurnForce = 0.1; // Maximum force for turning
    this.numOfSensors = 3;
    this.sensor = new Sensor(this, this.fov / 2, this.numOfSensors);
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
    fill(this.col[0], this.col[1], this.col[2]);
    stroke("black");
    rect(0, 0, this.w, this.h, this.w / 3, this.w / 3, 5, 5);

    // Draw the speedometer
    let speed = this.vel.mag();
    let speedAngle = map(speed, 0, this.maxSpeed, -PI / 4, PI / 4);
    let gaugeRadius = this.w / 1.5;

    // Draw the speedometer arc
    fill(0, 0, 100);
    stroke(0);
    arc(0, this.h * 0.5, gaugeRadius * 2, gaugeRadius * 2, -(3 * PI) / 4, -PI / 4, PIE);

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
    text(nf(speed * 10, 0, 2) + " pix/sec", 0, this.h / 2 + 30);

    pop();
    //this.sensor.show();
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
  
  update(roadBorders) {
    this.move();
    this.sensor.update(roadBorders);
    this.wrapAroundCanvas();
  }

  move() {
    this.acc.set(0, 0);
    if (this.vel.mag() < 0.1) {
      this.vel.set(0, 0);
    }

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
      const reverseAcc = createVector(-directionX, directionY).mult(this.maxForce / 2);
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
      this.pos.x = width + this.w / 2;
    } else if (this.pos.x - this.w / 2 > width) {
      this.pos.x = -this.w / 2;
    }

    if (this.pos.y + this.h / 2 < 0) {
      this.pos.y = height + this.h / 2;
    } else if (this.pos.y - this.h / 2 > height) {
      this.pos.y = -this.h / 2;
    }
  }
}
