class NeuralNetwork {
  constructor(inputCount) {
    this.levels = [];
    if (Array.isArray(inputCount)) {
      // Constructor with an array parameter
      for (let i = 0; i < inputCount.length - 1; i++) {
        this.levels.push(new Level(inputCount[i], inputCount[i + 1]));
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

  static feedForward(givenInputs, level, method = sigmoid) {
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

      //food for thought: what if we used a different activation function?
      //scientist method:
      //if(sum+level.biases[i]>0){
      //    level.outputs[i]=1;
      //}else{
      //    level.outputs[i]=0;
      //}
      //using the step activation function
      //level.outputs[i]=applyStepActivation(sum,level.biases[i]);
    }
    return level.outputs;
  }
}

class Visualizer{
    static drawNetwork(x,y,neuralNetwork){
        let numLevels=neuralNetwork.levels.length;
        let inputs=neuralNetwork.levels[0].inputs
        let outputs=neuralNetwork.levels[numLevels-1].outputs
        let hiddenLayers=numLevels-1;
        let hidden=neuralNetwork.levels[0].outputs
        let inputSpacing=(width/inputs.length)*0.5
        let hiddenSpacing=(width/hidden.length)*0.5
        let outputSpacing=(width/outputs.length)*0.5
        let layerSpacing=(height/numLevels+1)
        let hiddenBiases=car.brain.levels[0].biases
        let outputBiases=car.brain.levels[1].biases
        //draw input nodes horizontally at bottom where x,y is the top-left corner of the network


        //draw connections between input and hidden nodes with weights as strokeWeight and color(red if negative, green if positive) maping to 1 to 5 for weight(-1=>strokeWeight(5),color red) to (1=>strokeWeight(5),color green)) and bias under the hidden node
        for(let i=0;i<inputs.length;i++){
            for(let j=0;j<hidden.length;j++){
                let weight=neuralNetwork.levels[0].weights[i][j];
                let bias=hiddenBiases[j];
                let strokeW=map(abs(weight),0,1,0.2,3);
                let strokeC=weight>0?color(0,255,0):color(255,0,0);
                push()
                stroke(strokeC);
                strokeWeight(strokeW);
                line(x+(i+0.5)*inputSpacing,y+layerSpacing*(numLevels-1)-40,x+(j+0.5)*hiddenSpacing,y+layerSpacing*(numLevels-2));
                stroke(0);
                strokeWeight(1);
                fill(255)
                textAlign(CENTER,CENTER)
                rectMode(CENTER)
                rect(x+(j+0.5)*hiddenSpacing,y+layerSpacing*(numLevels-2)+40,30,20)
                fill(0)
                stroke(0)
                strokeWeight(0.5)
                text(nf(bias,0,2),x+(j+0.5)*hiddenSpacing,y+layerSpacing*(numLevels-2)+40);
                pop()
            }
        }

        //draw connections between hidden and output nodes with weights as strokeWeight and color(red if negative, green if positive) maping to 1 to 5 for weight(-1=>strokeWeight(5),color red) to (1=>strokeWeight(5),color green)) and bias under the output node
    
        for(let i=0;i<hidden.length;i++){
            for(let j=0;j<outputs.length;j++){
                let weight=neuralNetwork.levels[1].weights[i][j];
                let bias=outputBiases[j];
                let strokeW=map(abs(weight),0,1,0.2,3);
                let strokeC=weight>0?color(0,255,0):color(255,0,0);
                push()
                stroke(strokeC);
                strokeWeight(strokeW);
                line(x+(i+0.5)*hiddenSpacing,y+layerSpacing*(numLevels-2),x+(j+0.5)*outputSpacing,y+layerSpacing*(numLevels-3)+40);
                stroke(0);
                strokeWeight(1);
                fill(255)
                textAlign(CENTER,CENTER)
                rectMode(CENTER)
                rect(x+(j+0.5)*outputSpacing,y+layerSpacing*(numLevels-3)+40+40,30,20)
                fill(0)
                stroke(0)
                strokeWeight(0.5)
                text(nf(bias,0,2),x+(j+0.5)*outputSpacing,y+layerSpacing*(numLevels-3)+40+40);
                pop()
            }
        }

        for(let i=0;i<inputs.length;i++){
            let nodeX=x+(i+0.5)*inputSpacing;
            let nodeY=y+layerSpacing*(numLevels-1)-40//-layerSpacing*0.5;
            fill(0)
            stroke(200)
            circle(nodeX,nodeY,40);
            fill(255)
            textAlign(CENTER,CENTER)
            noStroke()
            text(nf(inputs[i],0,2),nodeX,nodeY);
        }
        //draw hidden nodes vertically in the middle where x,y is the top-left corner of the network for now only 1 hidden layer
        for(let i=0;i<hidden.length;i++){
            let nodeX=x+(i+0.5)*hiddenSpacing;
            let nodeY=y+layerSpacing*(numLevels-2)//-layerSpacing*0.5;
            fill(0)
            stroke(200)
            circle(nodeX,nodeY,40);
            fill(255)
            textAlign(CENTER,CENTER)
            noStroke()
            text(nf(hidden[i],0,2),nodeX,nodeY);
        }

        //draw output nodes horizontally at top where x,y is the top-left corner of the network
        for(let i=0;i<outputs.length;i++){
            let nodeX=x+(i+0.5)*outputSpacing;
            let nodeY=y+layerSpacing*(numLevels-3)+40;
            fill(0)
            stroke(200)
            circle(nodeX,nodeY,40);
            fill(255)
            textAlign(CENTER,CENTER)
            noStroke()
            text(nf(outputs[i],0,2),nodeX,nodeY);
        }


        //console.log(numLevels)
        //console.log(hiddenLayers)


       // console.log(hidden);




        

    }
}