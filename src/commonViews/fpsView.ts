import * as Phaser from "phaser";

/**
 * Fps表示
 */
export class FpsView extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    
    // テキスト
    const fontFamily = "Arial";
    const fontSize = 22;
    const text = this.scene.add.text(10, 10, "FPS: --", {
      fontSize: fontSize,
      fontFamily: fontFamily,
    });
    text.setFill("#ff00ff");

    // フレームごとにチェック
    this.scene.time.addEvent({
      delay: 200,
      loop: true,
      callback: () => {
        text.setText(`FPS: ${this.scene.game.loop.actualFps.toFixed(2)}`);
      },
    });

    this.add(text);
  }
}
