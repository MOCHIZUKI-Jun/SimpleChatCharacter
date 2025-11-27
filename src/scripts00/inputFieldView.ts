import Phaser from "phaser";
import {GetColorCodeByRGB, GetColorCodeTextByRGB} from "../utility/colorUtility.ts";
import {DefineDepth, INPUT_FIELD_BAR_HEIGHT} from "./define.ts";
import {TextInputField} from "../commonViews/textInputField.ts";

/**
 * テキスト入力ビュー
 */
export class InputFieldView extends Phaser.GameObjects.Container {
  
  private bar!: Phaser.GameObjects.Rectangle;
  private _textInputField!: TextInputField;
  public textInputField!: TextInputField;
  
  /**
   * コンストラクタ
   */
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
  
    const canvas = scene.game.canvas;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const height = INPUT_FIELD_BAR_HEIGHT;
    this.setSize(canvasWidth, height);
    this.setPosition(canvasWidth/2, canvasHeight - height/2);
    this.setDepth(DefineDepth.UI);
    
    this.createBar();
    this.createTextInputField();
  }
  
  private createTextInputField() {
    this._textInputField = new TextInputField(
      this.scene,
      "500px",
      "30px",
      GetColorCodeTextByRGB(255, 255, 255),
      GetColorCodeTextByRGB(0, 0, 0),
    );
    this._textInputField.setPosition(0, 0);
    this.add(this._textInputField);
  }
  
  private createBar() {
    // ピンク
    const color = GetColorCodeByRGB(255, 192, 203);
    this.bar = this.scene.add.rectangle(0, 0, this.width, this.height, color);
    this.add(this.bar);
  }
}