import Phaser from "phaser";
import {DefineDepth, MESSAGE_FLIP_TEXTURE_KEY, MESSAGE_TEXTURE_KEY, TEXT_COLOR} from "./define.ts";
import {GetColorCodeByRGB} from "../utility/colorUtility.ts";
import {FONT_SMARTFONTUI} from "../define.ts";
import {waitMilliSeconds} from "../utility/asyncUtility.ts";

const DEBUG = true;

/**
 * メッセージ表示ビュー
 */
export class MessageView extends Phaser.GameObjects.Container {

  private nineSlice!: Phaser.GameObjects.NineSlice;
  private text!: Phaser.GameObjects.Text;
  
  private fontSize : number;
  private maxWidth: number;
  private wrapMargin : number;
  private isFlip: boolean;
  private fillColor: number;
  
  /**
   * コンストラクタ
   * isFlip: 反転フラグ
   * isFlip = false 尻尾が左
   * isFlip = true  尻尾が右
   */
  constructor(scene: Phaser.Scene, fontSize: number, maxWidth: number, wrapMargin: number, isFlip: boolean, fillColor:number) {
    super(scene, 0, 0);
    scene.add.existing(this);
    
    this.fontSize = fontSize;
    this.maxWidth = maxWidth;
    this.wrapMargin = wrapMargin;
    this.isFlip = isFlip;
    this.fillColor = fillColor;
    
    this.setDepth(DefineDepth.UI);
    
    this.createImage();
    this.createText();
    this.updateDisplay();
    
    this.setText("・・・");
    
    if (DEBUG) {
      this.addDebugRect();
      this.debugAsync().then();
    }
  }
  
  public setText(message: string) {
    this.text.setText(message);
    this.updateDisplay();
  }
  
  private updateDisplay() {
    const textWidth = this.text.displayWidth + this.wrapMargin * 2;
    const textHeight = this.text.displayHeight + this.wrapMargin * 2;

    const imageMarginWidth = 80;
    const imageMarginHeight = 80;
    
    this.nineSlice.setSize(textWidth + imageMarginWidth, textHeight + imageMarginHeight);
  }

  private createText() {
    const wrapmargin = this.wrapMargin;
    const txt = this.scene.add.text(
      0,
      0,
      "テストテストテストテストテストテストテストテストテストテストテストテストテストテスト",
      {
        fontSize: this.fontSize,
        fontFamily: FONT_SMARTFONTUI,
        wordWrap: {
          width: this.maxWidth - wrapmargin * 2,
          useAdvancedWrap: true,
        },
      },
    );

    txt.setLineSpacing(10);
    txt.setPosition(wrapmargin, wrapmargin);
    if (this.isFlip) {
      txt.setOrigin(1, 1);
    } else {
      txt.setOrigin(0, 1);
    }
    txt.setColor(TEXT_COLOR);
    
    this.add(txt);
    this.text = txt;
  }
  
  private createImage() {
    const texKey = this.isFlip ? MESSAGE_FLIP_TEXTURE_KEY : MESSAGE_TEXTURE_KEY;
    const leftWidth = this.isFlip ? 60 : 100;
    const rightWidth = this.isFlip ? 100 : 60;
    
    this.nineSlice = this.scene.add.nineslice(
      0,
      0,
      texKey,
      undefined,
      360,
      120,
      leftWidth,
      rightWidth,
      60,
      60
    );
    this.nineSlice.setTintFill(this.fillColor);
    this.nineSlice.setTint(this.fillColor);
    if (this.isFlip) {
      this.nineSlice.setOrigin(1, 1);
      this.nineSlice.setPosition(48, 52);
      
    } else {
      this.nineSlice.setOrigin(0, 1);
      this.nineSlice.setPosition(-40, 52);
    }
    this.add(this.nineSlice);
  }
  
  private addDebugRect() {
    const color = GetColorCodeByRGB(255, 200, 200);
    const rect = this.scene.add.rectangle(
      0,
      0,
      20,
      20,
      color,
      0.8
    );
    this.add(rect);
  }
  
  private async debugAsync() {
    await waitMilliSeconds(1000);
    this.setText("テスト");
    await waitMilliSeconds(1000);
    this.setText("テストテスト")
    await waitMilliSeconds(1000);
    this.setText("テストテストテストテストテストテストテストテストテストテストテストテストテストテスト");
    await waitMilliSeconds(1000);
    this.setText("テストテストテストテストテスト\n" + "テストテストテストテストテスト\n");
  }
}