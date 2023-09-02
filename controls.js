class Controls {
  constructor() {
    this.forward = false;
    this.backward = false;
    this.left = false;
    this.right = false;
    this.brake = false;
    this.#keyboardInput();
  }

//   #keyboardInput() {
//     document.onkeydown = (e) => {
//       switch (e.key) {
//         case "ArrowUp":
//           this.forward = true;
//           break;
//         case "ArrowDown":
//           this.backward = true;
//           break;
//         case "ArrowLeft":
//           this.left = true;
//           break;
//         case "ArrowRight":
//           this.right = true;
//           break;
//         case " ": //space
//           this.brake = true;
//           break;
//       }
//       //console.table(this);
//     };
//     document.onkeyup = (e) => {
//       switch (e.key) {
//         case "ArrowUp":
//           this.forward = false;
//           break;
//         case "ArrowDown":
//           this.backward = false;
//           break;
//         case "ArrowLeft":
//           this.left = false;
//           break;
//         case "ArrowRight":
//           this.right = false;
//           break;
//         case " ": //space
//           this.brake = false;
//           break;
//       }
//       //console.table(this);
//     };
//   }
  #keyboardInput(){
      if(keyIsDown(UP_ARROW)){
          this.forward=true;
      }
      else{
          this.forward=false;
      }
      if(keyIsDown(DOWN_ARROW)){
          this.backward=true;
      }
      else{
          this.backward=false;
      }
      if(keyIsDown(LEFT_ARROW)){
          this.left=true;
      }
      else{
          this.left=false;
      }
      if(keyIsDown(RIGHT_ARROW)){
          this.right=true;
      }
      else{
          this.right=false;
      }
      if(keyIsDown(32)){
          this.brake=true;
      }
      else{
          this.brake=false;
      }
      //console.table(this)
  }
}
