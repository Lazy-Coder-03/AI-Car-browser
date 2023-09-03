class visNetwork {
  static drawNetwork(network, x, y, wid, hei) {
    const margin = 0;
    const left = margin + x;
    const top = margin + y;
    const w = wid;
    const h = hei;
    const levelHeight = h / network.levels.length;
    const levels = network.levels;

    // visNetwork.drawLevel(
    //   levels[2],
    //   left,
    //   top + levelHeight * (2 - 2),
    //   w,
    //   levelHeight
    // );
    // visNetwork.drawLevel(
    //   levels[1],
    //   left,
    //   top + levelHeight * (2 - 1),
    //   w,
    //   levelHeight
    // );
    // visNetwork.drawLevel(
    //   levels[0],
    //   left,
    //   top + levelHeight * (2 - 0),
    //   w,
    //   levelHeight
    // );
    for (let i = levels.length-1; i >=0; i--) {
        visNetwork.drawLevel(
          levels[i],
          left,
          top + levelHeight * (levels.length - i-1),
          w,
          levelHeight
        );
      }
      
  }

  static drawLevel(level, left, top, w, h) {
    const right = left + w;
    const bottom = top + h;
    const nodeRadius = width / 30;
    const biasRadius = nodeRadius * 1.5;
    const totalWidth = width / 2;
    const { inputs, outputs, weights, biases } = level;
    for (let i = 0; i < inputs.length; i++) {
      const nodeX1 = left + (i + 1) * (totalWidth / (inputs.length + 1));
      const nodeY1 = bottom ;

      for (let j = 0; j < outputs.length; j++) {
        const nodeX2 = left + (j + 1) * (totalWidth / (outputs.length + 1));
        const nodeY2 = top;

        strokeWeight(2);
        let alpha = map(abs(weights[i][j]), 0, 1, 0, 255);
        if (weights[i][j] > 0) stroke(255, 165, 0, alpha);
        else stroke(30, 144, 255, alpha);

        line(nodeX1, nodeY1, nodeX2, nodeY2);
      }
    }
    for (let i = 0; i < inputs.length; i++) {
      const nodeX = left + (i + 1) * (totalWidth / (inputs.length + 1));
      const nodeY = bottom;

      stroke(0);
      strokeWeight(1);
      fill(0);
      ellipse(nodeX, nodeY, biasRadius, biasRadius);

      let alpha = map(abs(inputs[i]), 0, 1, 0, 255);
      fill(0, 128, 0, alpha);
      ellipse(nodeX, nodeY, nodeRadius, nodeRadius);
      textAlign(CENTER, CENTER);

      fill(255);
      strokeWeight(1);
      stroke(0);
      textSize(nodeRadius * 0.4);
      text(nf(inputs[i], 0, 2), nodeX, nodeY);
    }

    for (let i = 0; i < outputs.length; i++) {
      const nodeX = left + (i + 1) * (totalWidth / (outputs.length + 1));
      const nodeY = top;

      fill(0);
      noStroke();
      ellipse(nodeX, nodeY, biasRadius, biasRadius); // for better visualization
      let a = map(abs(outputs[i]), 0, 1, 0, 255);
      fill(0, 128, 0, a);
      ellipse(nodeX, nodeY, nodeRadius, nodeRadius);
      textAlign(CENTER, CENTER);
      fill(255);
      strokeWeight(1);
      stroke(0);
      textSize(nodeRadius * 0.4);
      text(nf(outputs[i], 0, 2), nodeX, nodeY);
      noFill();

      // THE BIASES OF OUTPUTS
      push();
      let alpha = map(abs(biases[i]), 0, 1, 0, 255);
      if (biases[i] > 0) stroke(255, 165, 0, alpha);
      else stroke(30, 144, 255, alpha);
      drawingContext.setLineDash([3, 3]);
      strokeWeight(2);
      ellipse(nodeX, nodeY, biasRadius, biasRadius);
      drawingContext.setLineDash([]);
      textAlign(CENTER, CENTER);
      stroke(255);
      fill(0);
      rectMode(CENTER);
      rect(
        nodeX,
        nodeY + nodeRadius * 1.25,
        nodeRadius * 1.25,
        nodeRadius * 0.8
      );
      noFill();
      strokeWeight(1);
      if (biases[i] > 0) stroke(255, 165, 0);
      else stroke(30, 144, 255);
      textSize(nodeRadius * 0.5);
      text(nf(biases[i], 0, 2), nodeX, nodeY + nodeRadius * 1.25);
      pop();
    }
  }
  static olddrawLevel(level, left, top, w, h) {
    const right = left + w;
    const bottom = top + h;
    const nodeRadius = width / 30;
    const biasRadius = nodeRadius * 1.5;
    const margin = 0;
    const totalWidth = width / 2;
    const { inputs, outputs, weights, biases } = level;

    //push();

    for (let i = 0; i < inputs.length; i++) {
      for (let j = 0; j < outputs.length; j++) {
        strokeWeight(2);
        let alpha = map(abs(weights[i][j]), 0, 1, 0, 255);
        if (weights[i][j] > 0) stroke(255, 165, 0, alpha);
        else stroke(30, 144, 255, alpha);
        line(
          getNodeXcor(left, totalWidth, margin, i, inputs.length),
          bottom - height / 20,
          getNodeXcor(left, totalWidth, margin, j, outputs.length),
          top
        );
      }
    }

    for (let i = 0; i < inputs.length; i++) {
      const nodeX = getNodeXcor(left, totalWidth, margin, i, inputs.length);
      const nodeY = bottom - height / 20;
      stroke(0);
      strokeWeight(1);
      fill(0);
      ellipse(nodeX, nodeY, biasRadius, biasRadius);

      let alpha = map(abs(inputs[i]), 0, 1, 0, 255);
      fill(0, 128, 0, alpha);
      ellipse(nodeX, nodeY, nodeRadius, nodeRadius);
      textAlign(CENTER, CENTER);

      fill(255);
      strokeWeight(1);
      stroke(0);
      textSize(nodeRadius * 0.4);
      text(nf(inputs[i], 0, 2), nodeX, nodeY);
    }
    for (let i = 0; i < outputs.length; i++) {
      const nodeX = getNodeXcor(left, totalWidth, margin, i, outputs.length);
      const nodeY = top;
      //drawingContext.setLineDash([]);
      fill(0);
      noStroke();
      ellipse(nodeX, nodeY, biasRadius, biasRadius); //for better visualization
      let a = map(abs(outputs[i]), 0, 1, 0, 255);
      fill(0, 128, 0, a);
      ellipse(nodeX, nodeY, nodeRadius, nodeRadius);
      textAlign(CENTER, CENTER);
      fill(255);
      strokeWeight(1);
      stroke(0);
      textSize(nodeRadius * 0.4);
      text(nf(outputs[i], 0, 2), nodeX, nodeY);
      noFill();
      //THE BIASES OF OUTPUTS
      push();
      let alpha = map(abs(biases[i]), 0, 1, 0, 255);
      if (biases[i] > 0) stroke(255, 165, 0, alpha);
      else stroke(30, 144, 255, alpha);
      drawingContext.setLineDash([3, 3]);
      strokeWeight(2);
      ellipse(nodeX, nodeY, biasRadius, biasRadius);
      drawingContext.setLineDash([]);
      textAlign(CENTER, CENTER);
      stroke(255);
      fill(0);
      rectMode(CENTER);
      rect(
        nodeX,
        nodeY + nodeRadius * 1.25,
        nodeRadius * 1.25,
        nodeRadius * 0.8
      );
      noFill();
      strokeWeight(1);
      if (biases[i] > 0) stroke(255, 165, 0);
      else stroke(30, 144, 255);
      textSize(nodeRadius * 0.5);
      text(nf(biases[i], 0, 2), nodeX, nodeY + nodeRadius * 1.25);
      pop();
    }

    //pop();
  }
}

function getNodeXcor(left, totalWidth, margin, i, totalNodes) {
  return (
    left + margin + ((i + 1) * (totalWidth - 2 * margin)) / (totalNodes + 1)
  );
}
