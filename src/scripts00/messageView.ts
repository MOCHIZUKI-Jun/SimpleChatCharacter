import Phaser from "phaser";
import {DefineDepth, MESSAGE_TEXTURE_KEY, TEXT_COLOR} from "./define.ts";
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
  
  private fontSize = 30;
  private maxWidth: number;
  private wrapMargin = 4;
  
  /**
   * コンストラクタ
   */
  constructor(scene: Phaser.Scene, fontSize: number, maxWidth: number, wrapMargin: number) {
    super(scene, 0, 0);
    scene.add.existing(this);
    
    this.fontSize = fontSize;
    this.maxWidth = maxWidth;
    this.wrapMargin = wrapMargin;
    
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
    
    console.log(textWidth, textHeight);
    
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
    txt.setOrigin(0, 1);
    txt.setColor(TEXT_COLOR);
    
    this.add(txt);
    this.text = txt;
  }
  
  private createImage() {
    this.nineSlice = this.scene.add.nineslice(
      0,
      0,
      MESSAGE_TEXTURE_KEY,
      undefined,
      360,
      120,
      100,
      60,
      60,
      60
    );
    this.nineSlice.setTintFill(GetColorCodeByRGB(200,200,200));
    this.nineSlice.setOrigin(0, 1);
    this.nineSlice.setPosition(-40, 50);
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