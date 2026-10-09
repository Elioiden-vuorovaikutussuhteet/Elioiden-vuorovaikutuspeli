import Phaser from "phaser";
//camera code here
export default class CameraManager {
    private scene: Phaser.Scene;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private uiCamera!: Phaser.Cameras.Scene2D.Camera;
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.cursors = this.scene.input.keyboard!.createCursorKeys();

        this.setupCameras(this.scene.cameras)
        this.setupCameraZoom(this.scene.cameras.main)
        this.setupCameraDrag(this.scene.cameras.main)
        }

        private setupCameras(cameras: Phaser.Cameras.Scene2D.CameraManager) {
            const cam = cameras.main
            const screenW = cam.width;
            const screenH = cam.height;
        
            cam.setBounds(-screenW, -screenH, screenW * 3, screenH * 3);
            cam.scrollX = 0;
            cam.scrollY = 0;
        
            this.uiCamera = cameras.add(0, 0, screenW, screenH);
            this.uiCamera.setScroll(0, 0);
            this.uiCamera.setZoom(1);
        }

        private setupCameraZoom(cam: Phaser.Cameras.Scene2D.Camera) {
            //Mouse wheel zoom event
            this.scene.input.on(
              "wheel",
              (
                _pointer: Phaser.Input.Pointer,
                _over: Phaser.GameObjects.GameObject[],
                _dx: number,
                dy: number,
              ) => {
                const zoomChange = dy > 0 ? -0.1 : 0.1;
                cam.setZoom(Phaser.Math.Clamp(cam.zoom + zoomChange, 0.5, 2.0));
              },
            );
        }

        private setupCameraDrag(cam: Phaser.Cameras.Scene2D.Camera) {
            // Right mouse button for dragging the scene
            this.scene.input.mouse?.disableContextMenu();
            let isDragging = false;
            let dragStartX = 0;
            let dragStartY = 0;
        
            this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
              if (pointer.rightButtonDown()) {
                isDragging = true;
                dragStartX = pointer.x;
                dragStartY = pointer.y;
              }
            });
        
            this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
              if (pointer.rightButtonReleased()) {
                isDragging = false;
              }
            });
        
            this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
              if (isDragging) {
                const dx = pointer.x - dragStartX;
                const dy = pointer.y - dragStartY;
        
                cam.scrollX -= dx / cam.zoom;
                cam.scrollY -= dy / cam.zoom;
        
                dragStartX = pointer.x;
                dragStartY = pointer.y;
              }
            });
        }

    private updateCamera(cam: Phaser.Cameras.Scene2D.Camera) {
        const speed = 10;
        if (this.cursors.left.isDown) {
          cam.scrollX -= speed;
        } else if (this.cursors.right.isDown) {
          cam.scrollX += speed;
        }
    
        if (this.cursors.up.isDown) {
          cam.scrollY -= speed;
        } else if (this.cursors.down.isDown) {
          cam.scrollY += speed;
        }
      }
    
    update() {
        this.updateCamera(this.scene.cameras.main);
    }

    getUICamera() {
        return this.uiCamera;
    }
}