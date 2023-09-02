class NeuralNetwork {
    constructor(inputCount, hiddenCount, outputCount) {
        this.levels = [];
        if (Array.isArray(inputCount)) {
            // Constructor with an array parameter
            for (let i = 0; i < inputCount.length - 1; i++) {
                this.levels.push(new Level(inputCount[i], inputCount[i + 1]));
            }
        } else {
            // Constructor with individual parameters
            this.levels.push(new Level(inputCount, hiddenCount));
            this.levels.push(new Level(hiddenCount, outputCount));
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




class Level{
    constructor(inputCount, outputCount){
        this.inputs=new Array(inputCount);
        this.outputs=new Array(outputCount);
        this.biases=new Array(outputCount);
        this.weights=[]
        for(let i=0;i<inputCount;i++){
            this.weights[i]=new Array(outputCount);
        }
        Level.#randomize(this);
    }
    static #randomize(level){
        for(let i=0;i<level.inputs.length;i++){
            for(let j=0;j<level.outputs.length;j++){
                level.weights[i][j]=getRandomFloat(-1,1);
            }
        }
        for(let i=0;i<level.biases.length;i++){
            level.biases[i]=getRandomFloat(-1,1);
        }
    }

    static feedForward(givenInputs,level,method=applyStepActivation){
        for(let i=0;i<givenInputs.length;i++){
            level.inputs[i]=givenInputs[i];
        }
        for(let i=0;i<level.outputs.length;i++){
            let sum=0;
            for(let j=0;j<level.inputs.length;j++){
                sum+=level.inputs[j]*level.weights[j][i];
            }
            //using step threshold
            //level.outputs[i]=stepThreshold(sum,level.biases[i])
            //using sigmoid
            switch(method){
                case sigmoid:
                    level.outputs[i]=sigmoid(sum+level.biases[i]);
                    break;
                case applyStepActivation:
                    level.outputs[i]=applyStepActivation(sum,level.biases[i]);
                    break;
                default:
                    level.outputs[i]=applyStepActivation(sum,level.biases[i]);   
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