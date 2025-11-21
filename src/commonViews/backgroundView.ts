/**
 * 背景ビュー
 */
export class BackgroundView extends Phaser.GameObjects.Container {

  /**
   * コンストラクタ
   */
  constructor(scene: Phaser.Scene, color: number) {
    super(scene, 0, 0);
    scene.add.existing(this);

    const canvas = scene.game.canvas;
    const rect = scene.add.rectangle(
      0,
      0,
      canvas.width,
      canvas.height,
      color,
      1);
    this.add(rect);
    
    this.setPosition(canvas.width / 2, canvas.height / 2);
  }
}