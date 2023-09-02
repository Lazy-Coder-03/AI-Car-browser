class Road {
  constructor(x, wid, lanecount = 2) {
    this.x = x;
    this.wid = wid;
    this.lanecount = lanecount;
    this.left = x - this.wid / 2;
    this.right = x + this.wid / 2;
    this.top = -100000; //-height;
    this.bottom = 100000; //height;
    const topLeft = { x: this.left, y: this.top };
    const topRight = { x: this.right, y: this.top };
    const bottomLeft = { x: this.left, y: this.bottom };
    const bottomRight = { x: this.right, y: this.bottom };
    this.borders = [
      [topLeft, bottomLeft],
      [topRight, bottomRight],
    ];
  }

  show() {
    push();
    strokeWeight(5);
    stroke("white");
    for (let i = 1; i < this.lanecount; i++) {
      let x = lerp(this.left, this.right, i / this.lanecount);
      drawingContext.setLineDash([20, 20]);
      line(x, this.top, x, this.bottom);
    }
    drawingContext.setLineDash([]);
    line(this.left, this.top, this.left, this.bottom);
    line(this.right, this.top, this.right, this.bottom);
    //line(this.left,this.top,this.left,this.bottom);
    //line(this.right,this.top,this.right,this.bottom);
    pop();
  }
  getLaneCenter(laneIndex) {
    let laneWidth = this.wid / this.lanecount;

    return this.left + laneWidth * (laneIndex + 0.5);
  }
  getLaneWidth() {
    return this.wid / this.lanecount;
  }
}
