class Sensor {
  constructor(car, fov, n) {
    this.car = car;
    this.rayCount = n;
    this.rayLength = this.car.h * 1.5;
    this.rayAngle = fov;
    this.rays = Array(n)
      .fill()
      .map(() => new Ray());
    this.roadDistances = Array(n).fill(this.rayLength);
    this.trafficDistances = Array(n).fill(this.rayLength);
    this.distances = Array(n).fill(this.rayLength);
  }

  update(roadBorders, traffic) {
    this.castRaysTraffic(traffic);
    this.castRaysBorders(roadBorders);
    this.roadDistances = this.roadDistances.map((distance) =>
      map(distance, 0, this.rayLength, 0, 1)
    );
    this.trafficDistances = this.trafficDistances.map((distance) =>
      map(distance, 0, this.rayLength, 0, 1)
    );
    for (let i = 0; i < this.rayCount; i++) {
      this.distances[i] = min(this.roadDistances[i], this.trafficDistances[i]);
    }
  }

  castRaysTraffic(traffic) {
    for (let i = 0; i < this.rayCount; i++) {
      const angle =
        map(i, 0, this.rayCount - 1, -this.rayAngle, this.rayAngle) - PI / 2;
      this.rays[i].update(this.car, angle);
    }

    for (let i = 0; i < this.rayCount; i++) {
      let closest = null;
      let record = this.rayLength;

      for (let j = 0; j < traffic.length; j++) {
        for (let k = 0; k < traffic[j].polygon.length; k++) {
          const pt = this.rays[i].cast(
            traffic[j].polygon[k],
            traffic[j].polygon[(k + 1) % traffic[j].polygon.length]
          );

          if (pt) {
            const d = p5.Vector.dist(this.car.pos, pt);
            if (d < record) {
              record = d;
              closest = pt;
            }
          }
        }
      }

      this.trafficDistances[i] = record;
    }
  }

  castRaysBorders(roadBorders) {
    for (let i = 0; i < this.rayCount; i++) {
      const angle =
        map(i, 0, this.rayCount - 1, -this.rayAngle, this.rayAngle) - PI / 2;
      this.rays[i].update(this.car, angle);
    }

    for (let i = 0; i < this.rayCount; i++) {
      let closest = null;
      let record = this.rayLength;

      for (let j = 0; j < roadBorders.length; j++) {
        const pt = this.rays[i].cast(roadBorders[j][0], roadBorders[j][1]);

        if (pt) {
          const d = p5.Vector.dist(this.car.pos, pt);
          if (d < record) {
            record = d;
            closest = pt;
          }
        }
      }

      this.roadDistances[i] = record;
    }
  }

  show() {
    for (let i = 0; i < this.rayCount; i++) {
      let length = this.distances[i] * this.rayLength;
      let a = this.car.angle + map(i, 0, this.rayCount - 1, -this.rayAngle, this.rayAngle)-PI/2;
      let x = length * cos(a);
      let y = length * sin(a);
      push();
      strokeWeight(3);
      if (this.distances[i] < 1) {
        stroke(255, 0, 0);
      } else {
        stroke(0, 255, 0);
      }
      line(
        this.car.pos.x,
        this.car.pos.y,
        this.car.pos.x + x,
        this.car.pos.y + y
      );
      pop();
    }
  }
}

class Ray {
  constructor() {
    this.start = createVector();
    this.end = createVector();
  }

  update(car, angle) {
    this.start.set(car.pos.x, car.pos.y);
    this.end.set(
      car.pos.x + car.h * 1.5 * cos(car.angle + angle),
      car.pos.y + car.h * 1.5 * sin(car.angle + angle)
    );
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

    // Implement or replace checkLineToLineIntersection function
    const intersection = checkLineToLineIntersection(
      x1,
      y1,
      x2,
      y2,
      x3,
      y3,
      x4,
      y4
    );

    if (intersection) {
      return intersection;
    } else {
      return null;
    }
  }

  show() {
    push();
    strokeWeight(3);
    stroke(255);
    line(this.start.x, this.start.y, this.end.x, this.end.y);
    textSize(20);
  }
}
