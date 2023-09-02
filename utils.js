function checkLineToLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
  const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  if (den == 0) {
    return null;
  }

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

  if (t > 0 && t < 1 && u > 0) {
    const pt = createVector();
    pt.x = x1 + t * (x2 - x1);
    pt.y = y1 + t * (y2 - y1);
    return pt;
  } else {
    return null;
  }
}
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.random() * (max - min + 1) + min; // The maximum is inclusive and the minimum is inclusive
}
function getRandomFloat(min, max) {
  // Generate a random float between 0 (inclusive) and 1 (exclusive)
  const randomFloat = Math.random();

  // Calculate the range between max and min
  const range = max - min;

  // Scale and shift the random float to fit within the desired range
  const scaledRandomFloat = randomFloat * range;

  // Add the minimum value to the scaled random float to get a value in the specified range
  const result = scaledRandomFloat + min;

  return result;
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}
function stepThreshold(x, t) {
  return x > t ? 1 : 0;
}
function applyStepActivation(sum, bias) {
  return sum + bias > 0 ? 1 : 0;
}
