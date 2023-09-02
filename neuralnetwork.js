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

    static feedForward(givenInputs,level){
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
            //sum+=level.biases[i];
            //level.outputs[i]=sigmoid(sum);

            //food for thought: what if we used a different activation function?
            //scientist method:
            //if(sum+level.biases[i]>0){
            //    level.outputs[i]=1;
            //}else{
            //    level.outputs[i]=0;
            //}
            //using the step activation function
            level.outputs[i]=applyStepActivation(sum,level.biases[i]);

        }
        return level.outputs;
    }
}