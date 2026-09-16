import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    
    const menuWidth = 500;
    const menuHeight = 300;

    const backround = this.add.graphics();
    backround.fillStyle(0x000000, 0.7);
    backround.fillRoundedRect(
        centerX - menuWidth / 2, 
        centerY - menuHeight / 2, 
        menuWidth, 
        menuHeight,
        40
    );

    const border = this.add.graphics();
    border.lineStyle(10, 0xffffff, 1);
    border.strokeRoundedRect(
        centerX - menuWidth / 2, 
        centerY - menuHeight / 2, 
        menuWidth, 
        menuHeight,
        40
    );

    const button = this.add
      .rectangle(centerX, centerY, 150, 60, 0x00aa00)
      .setInteractive();

    this.add.text(centerX, centerY, 'Start Game', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    button.on('pointerdown', () => {
      this.scene.stop();
    });
  }
}