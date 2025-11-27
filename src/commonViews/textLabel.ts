import {FONT_SMARTFONTUI} from "../define.ts";
import {tweenAsync} from "../utility/tweenAsync.ts";

/**
 * テキストラベル
 */
export class TextLabel extends Phaser.GameObjects.Container {

  private readonly text!: Phaser.GameObjects.Text;
  
  /**
   * コンストラクタ
   */
  constructor(scene: Phaser.Scene, colorCode: string, alpha: number, fontSize: number) {
    super(scene, 0, 0);
    scene.add.existing(this);

    this.text = this.scene.add.text(0, 0, "", {
      fontSize: fontSize,
      fontFamily: FONT_SMARTFONTUI,
    });
    this.text.setOrigin(0.5, 0.5);
    this.text.setAlpha(alpha);
    this.text.setFill(colorCode);
    this.add(this.text);
  }
  
  /**
   * 文字列セット
   */
  public setText(str: string) {
    this.text.setText(str);
  }
  
  /**
   * 文字列の表示サイズ取得
   */
  public getTextDisplaySize() {
    return {
      width: this.text.displayWidth,
      height: this.text.displayHeight,
    };
  }
  
  /**
   * アニメーション付きで文字列セット
   */
  public setTextAsync(str: string, delay = 0) {
    this.setAlpha(0);
    this.text.setText(str);
    return this.showAsync(delay);
  }

  /**
   * 表示
   */
  public async showAsync(delay = 0) {
    await tweenAsync(this.scene, {
      targets: this,
      alpha:1,
      delay: delay,
      duration: 780
    });
  }

  /**
   * 非表示(無効化)
   */
  public async hideAsync() {
    await tweenAsync(this.scene, {
      targets: this,
      alpha:0,
      duration: 220
    });
  }
}