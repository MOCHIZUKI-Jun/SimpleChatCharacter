import * as Phaser from "phaser";
import {SimpleObservable} from "../utility/simpleObservable.ts";
import {ReadonlyObservableInterface} from "../utility/simpleDisposableInterface.ts";
import {getWorldPos} from "../utility/transformUtility.ts";
import {isVisibleWithParent} from "../utility/containerUtility.ts";
import {isMobile} from "../define.ts";

const DEBUG = false;

// スマホでの最小フォントサイズ
const SAFETY_FONT_SIZE = 16.5;

/**
 * テキスト入力フィールド
 */
export class TextInputField extends Phaser.GameObjects.Container {
  protected readonly _onTextUpdate: SimpleObservable = new SimpleObservable();
  public onTextUpdate: ReadonlyObservableInterface = this._onTextUpdate;
  private inputElement!: HTMLInputElement;
  private isVisibleInHierarchy = true;

  private isFocused = false;
  private leftOnUnfocus = 0;
  private bottomDiffOnUnfocus = 0;
  
  constructor(
    scene: Phaser.Scene,
    styleWidth: string,
    styleFontSize: string,
    color: string,
    textColor: string,
  ) {
    super(scene, 0, 0);
    scene.add.existing(this);
    
    const width = Number.parseInt(styleWidth.replace("px", ""));
    const height = Number.parseInt(styleFontSize.replace("px", ""));
    this.setSize(width, height);
    


    console.log(this.width, this.height);
    if (DEBUG) this.addDebugRect();

    // HTML の `<input>` を作成
    this.inputElement = document.createElement("input");
    this.inputElement.type = "text";
    this.inputElement.style.position = "absolute";
    this.inputElement.style.fontSize = styleFontSize;
    this.inputElement.style.backgroundColor = color;
    this.inputElement.style.color = textColor;
    this.inputElement.style.borderWidth = "0px";
    this.inputElement.style.outlineWidth = "0px";
    this.inputElement.style.touchAction = "none";

    this.inputElement.addEventListener('focus', () => {
      console.log("isFocused");
      this.isFocused = true;
    });
    
    this.inputElement.addEventListener('blur', () => {
      console.log("isBlurred");
      this.isFocused = false;
    })

    document.body.appendChild(this.inputElement);

    this.inputElement.oninput = () => {
      const txt = this.inputElement.value;
      console.log("入力されたテキスト:", txt);
      this._onTextUpdate.on(txt);
    };

    // シーンが終了したら削除
    this.scene.events.on("shutdown", () => {
      this.inputElement.remove();
    });
    
    // 毎フレーム更新
    this.scene.events.on("update", () => {
      this.updatePosition();
      const isVisibleInHierarchy = isVisibleWithParent(this);
      if (isVisibleInHierarchy && !this.isVisibleInHierarchy) {
        this.showField();
      } else if (!isVisibleInHierarchy && this.isVisibleInHierarchy) {
        this.hideField();
      }
      this.isVisibleInHierarchy = isVisibleInHierarchy;
    });
  }

  private updatePosition() {
    if (this.isFocused) {
      this.checkViewportPosition();
      this.updatePositionOnFocus();
    } else {
      this.updatePositionOnUnfocus();
    }
  }

  /**
   * ビューポートの左下からの位置をチェック
   */
  private checkViewportPosition() {
    const rect = this.inputElement.getBoundingClientRect();
    const vh = window.innerHeight;
    this.leftOnUnfocus = rect.left;
    this.bottomDiffOnUnfocus = vh - rect.bottom;
  }
  
  /**
   * フォーカス時(スマートフォン)のテキストフィールド位置更新
   */
  private updatePositionOnFocus() {
    if (!isMobile) return;
    
    this.inputElement.style.position = 'fixed';

    const vh = window.innerHeight;
    const leftOnFocus = this.leftOnUnfocus;
    const bottomOnFocus = vh - this.bottomDiffOnUnfocus;
    
    this.inputElement.style.left = leftOnFocus + 'px';
    this.inputElement.style.bottom = bottomOnFocus + 'px';
    this.inputElement.style.transform = 'none';
  }
  
  /**
   * 通常のテキストフィールド位置更新
   */
  private updatePositionOnUnfocus() {
    const worldPos = getWorldPos(this);

    const canvas = this.scene.game.canvas;
    const canvasBounds = canvas.getBoundingClientRect();

    // devicePixelRatioを考慮したスケール計算
    const scaleX = canvasBounds.width / canvas.width;
    const scaleY = canvasBounds.height / canvas.height;
    const dpr = window.devicePixelRatio || 1;

    // world座標をCSSピクセルに変換
    const addX = worldPos.x * scaleX;
    const addY = worldPos.y * scaleY;

    // サイズもスケール
    const width = this.width * scaleX;
    const height = this.height * scaleY;

    const left = canvasBounds.left + addX - width / 2;
    const top = canvasBounds.top + addY - height / 2;

    this.inputElement.style.position = "absolute";
    this.inputElement.style.left = `${left}px`;
    this.inputElement.style.top = `${top}px`;
    this.inputElement.style.width = `${width}px`;
    this.inputElement.style.height = `${height}px`;
    // devicePixelRatioを考慮したフォントサイズ
    const useSize = Math.max(height * 0.9 / dpr, SAFETY_FONT_SIZE);
    this.inputElement.style.fontSize = `${useSize}px`;
  }

  private hideField() {
    console.log("hideField");
    this.inputElement.style.display = "none";
  }

  private showField() {
    console.log("showField");
    this.inputElement.style.display = "block";
  }

  private addDebugRect() {
    const rect = this.scene.add.rectangle(
      0,
      0,
      this.width,
      this.height,
      0x00ff00,
      0.5,
    );
    this.add(rect);
  }
}
