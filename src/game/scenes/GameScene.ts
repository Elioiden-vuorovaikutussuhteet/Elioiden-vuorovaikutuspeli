import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

 
  
  preload (){
        //  Load the assets for the game
        this.load.setPath('assets');

        this.load.image('bullhornacacia', 'bullhornacacia.png');
        
  }

  create() {
    this.scene.launch('MenuScene');
    this.time.delayedCall(5000, () => {
      console.log("5 seconds passed!");
    });
    this.add.image(512, 384, 'bullhornacacia');
  }


  update() {
  }
}