class Sensor {
  constructor(car, fov, n) {
    this.car = car;
    this.rayCount = n;
    this.rayLength = this.car.h * 1.5;
    this.rayAngle = fov;
    this.rays = [];
    this.distances = Array(n).fill(this.rayLength);
  }

  update(roadBorders) {
    this.castRays(roadBorders);
    this.distances = this.distances.map((distance) =>
      map(distance, 0, this.rayLength, 0, 1)
    );
  }

  castRays(roadBorders) {
    this.rays = [];
    for (let i = 0; i < this.rayCount; i++) {
      let angle = -PI / 2;
      if (this.rayCount > 1) {
        angle = map(i, 0, this.rayCount - 1, -this.rayAngle, this.rayAngle) - PI / 2;
      }

      const start = createVector(this.car.pos.x, this.car.pos.y);
      const end = createVector(
        this.car.pos.x + this.rayLength * cos(this.car.angle + angle),
        this.car.pos.y + this.rayLength * sin(this.car.angle + angle)
      );

      this.rays.push(new Ray(start, end));
    }

    for (let i = 0; i < this.rayCount; i++) {
      let closest = null;
      let record = this.rayLength;

      for (let border of roadBorders) {
        const pt = this.rays[i].cast(border[0], border[1]);

        if (pt) {
          const d = p5.Vector.dist(this.car.pos, pt);
          if (d < record) {
            record = d;
            closest = pt;
          }
        }
      }

      this.distances[i] = record;

      if (closest) {
        push();
        strokeWeight(3);
        stroke(255, 0, 0);
        line(this.car.pos.x, this.car.pos.y, closest.x, closest.y);
        pop();
      }
      else{
        push();
        strokeWeight(3);
        stroke(0, 255, 0);
        line(this.car.pos.x, this.car.pos.y, this.rays[i].end.x, this.rays[i].end.y);
        pop();
      }
    }
  }

  show() {
    for (let ray of this.rays) {
      ray.show();
    }
  }
}

class Ray {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  cast(borderStart, borderEnd) {
    const x1 = borderStart.x;
    const y1 = borderStart.y;
    const x2 = borderEnd.x;
    const y2 = borderEnd.y;
    const x3 = this.start.x;
    const y3 = this.start.y;
    const x4 = this.end.x;
    const y4 = this.end.y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (den == 0) {
      return;
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

    if (t > 0 && t < 1 && u > 0) {
      const pt = createVector();
      pt.x = x1 + t * (x2 - x1);
      pt.y = y1 + t * (y2 - y1);
      return pt;
    } else {
      return;
    }
  }

  show() {
    push();
    strokeWeight(3);
    stroke(255);
    line(this.start.x, this.start.y, this.end.x, this.end.y);
    pop();
  }
}
