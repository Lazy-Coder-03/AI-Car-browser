class NeuralNetwork {
  constructor(nodeCount) {
    this.levels = [];
    if (Array.isArray(nodeCount)) {
      // Constructor with an array parameter
      for (let i = 0; i < nodeCount.length - 1; i++) {
        this.levels.push(new Level(nodeCount[i], nodeCount[i + 1]));
      }
    } else {
      // Constructor with a number parameter
      for (let i = 0; i < arguments.length - 1; i++) {
        this.levels.push(new Level(arguments[i], arguments[i + 1]));
      }
    }
  }

  static feedForward(givenInputs, neuralNetwork) {
    let outputs = Level.feedForward(givenInputs, neuralNetwork.levels[0]);
    for (let i = 1; i < neuralNetwork.levels.length; i++) {
      outputs = Level.feedForward(outputs, neuralNetwork.levels[i]);
    }
    return outputs;
  }
  //chatgpt mutate function
  mutate(rate) {
    let mutated = false;

    function mutate(val) {
      if (Math.random() < rate) {
        mutated = true;
        val=constrain(val+randomGaussian(0,0.05), -1, 1)
        return val;
      } else {
        mutated = false;
        return val;
      }
    }

    for (const level of this.levels) {
      for (let i = 0; i < level.inputs.length; i++) {
        for (let j = 0; j < level.outputs.length; j++) {
          level.weights[i][j] = mutate(level.weights[i][j]);
        }
      }
      for (let i = 0; i < level.biases.length; i++) {
        level.biases[i] = mutate(level.biases[i]);
      }
    }

    return mutated;
  }

  //main mutation (default method)
  // mutate(mutationRate) {
  //   for (let i = 0; i < this.levels.length; i++) {
  //     let level = this.levels[i];
  //     for (let j = 0; j < level.weights.length; j++) {
  //       for (let k = 0; k < level.weights[j].length; k++) {
  //         if (Math.random() < mutationRate) {
  //           level.weights[j][k] += getRandomFloat(-0.1, 0.1);
  //         }
  //       }
  //     }
  //     for (let j = 0; j < level.biases.length; j++) {
  //       if (Math.random() < mutationRate) {
  //         level.biases[j] += getRandomFloat(-0.1, 0.1);
  //       }
  //     }
  //   }
  // }

  static crossOver(parent1, parent2, fitness1, fitness2) {
    if (fitness1 < 0 || fitness2 < 0) {
      throw new Error("Fitness scores must be non-negative.");
    }

    // Calculate the mixing ratio based on fitness scores
    const totalFitness = fitness1 + fitness2;
    const mixingRatio = fitness1 / totalFitness;

    const child = new NeuralNetwork(neuralStructure);

    for (let i = 0; i < parent1.levels.length; i++) {
      const level = parent1.levels[i];
      const childLevel = child.levels[i];
      const partnerLevel = parent2.levels[i];

      for (let j = 0; j < level.weights.length; j++) {
        for (let k = 0; k < level.weights[j].length; k++) {
          // Use a weighted average to blend the weights
          childLevel.weights[j][k] =
            mixingRatio * level.weights[j][k] +
            (1 - mixingRatio) * partnerLevel.weights[j][k];
        }
      }

      for (let j = 0; j < level.biases.length; j++) {
        // Use a weighted average to blend the biases
        childLevel.biases[j] =
          mixingRatio * level.biases[j] +
          (1 - mixingRatio) * partnerLevel.biases[j];
      }
    }

    return child;
  }

  // static crossOver(parent1, parent2) {
  //   let child = new NeuralNetwork(neuralStructure);

  //   for (let i = 0; i < parent1.levels.length; i++) {
  //     let level = parent1.levels[i];
  //     let childLevel = child.levels[i];
  //     let partnerLevel = parent2.levels[i];
  //     for (let j = 0; j < level.weights.length; j++) {
  //       for (let k = 0; k < level.weights[j].length; k++) {
  //         if (Math.random() < 0.5) {
  //           childLevel.weights[j][k] = level.weights[j][k];
  //         } else {
  //           childLevel.weights[j][k] = partnerLevel.weights[j][k];
  //         }
  //       }
  //     }
  //     for (let j = 0; j < level.biases.length; j++) {
  //       if (Math.random() < 0.5) {
  //         childLevel.biases[j] = level.biases[j];
  //       } else {
  //         childLevel.biases[j] = partnerLevel.biases[j];
  //       }
  //     }
  //   }

  //   return child;
  // }

  static braincopy(brain) {
    for (let i = 0; i < this.levels.length; i++) {
      let level = this.levels[i];
      let childLevel = brain.levels[i];
      for (let j = 0; j < level.weights.length; j++) {
        for (let k = 0; k < level.weights[j].length; k++) {
          childLevel.weights[j][k] = level.weights[j][k];
        }
      }
      for (let j = 0; j < level.biases.length; j++) {
        childLevel.biases[j] = level.biases[j];
      }
    }
  }
}

class Level {
  constructor(inputCount, outputCount) {
    this.inputs = new Array(inputCount).fill(0);
    this.outputs = new Array(outputCount).fill(0);
    this.biases = new Array(outputCount).fill(0);
    this.weights = [];
    for (let i = 0; i < inputCount; i++) {
      this.weights[i] = new Array(outputCount);
    }
    Level.#randomize(this);
  }
  static #randomize(level) {
    for (let i = 0; i < level.inputs.length; i++) {
      for (let j = 0; j < level.outputs.length; j++) {
        level.weights[i][j] = getRandomFloat(-1, 1);
      }
    }
    for (let i = 0; i < level.biases.length; i++) {
      level.biases[i] = getRandomFloat(-1, 1);
    }
  }

  static feedForward(givenInputs, level, method = applyStepActivation) {
    for (let i = 0; i < givenInputs.length; i++) {
      level.inputs[i] = givenInputs[i];
    }
    for (let i = 0; i < level.outputs.length; i++) {
      let sum = 0;
      for (let j = 0; j < level.inputs.length; j++) {
        sum += level.inputs[j] * level.weights[j][i];
      }
      //using step threshold
      //level.outputs[i]=stepThreshold(sum,level.biases[i])
      //using sigmoid
      switch (method) {
        case sigmoid:
          level.outputs[i] = sigmoid(sum + level.biases[i]);
          break;
        case applyStepActivation:
          level.outputs[i] = applyStepActivation(sum, level.biases[i]);
          break;
        default:
          level.outputs[i] = applyStepActivation(sum, level.biases[i]);
      }
    }
    return level.outputs;
  }

  // crossover(partner) {
  //   let child = new Level(this.inputs.length, this.outputs.length);
  //   for (let i = 0; i < this.weights.length; i++) {
  //     for (let j = 0; j < this.weights[i].length; j++) {
  //       if (Math.random() < 0.5) {
  //         child.weights[i][j] = this.weights[i][j];
  //       } else {
  //         child.weights[i][j] = partner.weights[i][j];
  //       }
  //     }
  //   }
  //   for (let i = 0; i < this.biases.length; i++) {
  //     if (Math.random() < 0.5) {
  //       child.biases[i] = this.biases[i];
  //     } else {
  //       child.biases[i] = partner.biases[i];
  //     }
  //   }
  //   return child;
  // }
}
