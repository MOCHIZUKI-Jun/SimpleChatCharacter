import * as Phaser from "phaser";
import {SimpleObservable} from "../utility/simpleObservable.ts";
import {ReadonlyObservableInterface} from "../utility/simpleDisposableInterface.ts";
import {getWorldPos} from "../utility/transformUtility.ts";
import {isVisibleWithParent} from "../utility/containerUtility.ts";

const DEBUG = true;

/**
 * テキスト入力フィールド
 */
export class TextInputField extends Phaser.GameObjects.Container {
  protected readonly _onTextUpdate: SimpleObservable = new SimpleObservable();
  public onTextUpdate: ReadonlyObservableInterface = this._onTextUpdate;
  private inputElement!: HTMLInputElement;
  private isVisibleInHierarchy = true;

  private worldPos = {x: 0, y: 0};
  private windowWidth = 0;
  private windowHeight = 0;
  
  constructor(
    scene: Phaser.Scene,
    styleWidth: string,
    styleFontSize: string,
    color: string,
    textColor: string,
  ) {
    super(scene, 0, 0);

    const width = Number.parseInt(styleWidth.replace("px", ""));
    const height = Number.parseInt(styleFontSize.replace("px", ""));
    this.setSize(width, height);
    if (DEBUG) this.addDebugRect();

    // HTML の `<input>` を作成
    this.inputElement = document.createElement("input");
    this.inputElement.type = "text";
    this.inputElement.style.position = "absolute";
    this.inputElement.style.fontSize = styleFontSize;
    this.inputElement.style.backgroundColor = color;
    this.inputElement.style.color = textColor;
    this.inputElement.style.touchAction = "none"; // NOTE:スマホでzoomさせたくないが機能しない

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
    
    this.worldPos = getWorldPos(this);
    
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
    // 現在のウィンドウのサイズ
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const isSameWindowSize =
      this.windowWidth === windowWidth && this.windowHeight === windowHeight;
    
    // 現在のワールド座標
    const worldPos = getWorldPos(this);
    
    const isSameWorldPos =
      this.worldPos.x === worldPos.x && this.worldPos.y === worldPos.y;
    
    // ウィンドウサイズと位置が変わっていないのであればリターン
    if (isSameWindowSize && isSameWorldPos) {
      return;
    }
    
    this.worldPos = worldPos;
    this.windowWidth = windowWidth;
    this.windowHeight = windowHeight;
    
    const bounds = this.getBounds();
    const canvasBounds = this.scene.game.canvas.getBoundingClientRect();

    const rateW = canvasBounds.width / this.scene.game.canvas.width;

    const addX = worldPos.x * rateW;
    const addY = worldPos.y * rateW;

    const width = bounds.width * rateW;
    const height = bounds.height * rateW;

    const left = canvasBounds.left + addX - width / 2;
    const top = canvasBounds.top + addY - height / 2;

    //console.log("bounds", bounds);
    //console.log("worldPos", worldPos);
    //console.log("canvasBounds", canvasBounds);
    //console.log(`left:${left} top:${top}`);

    this.inputElement.style.left = `${left}px`;
    this.inputElement.style.top = `${top}px`;
    this.inputElement.style.width = `${width}px`;
    this.inputElement.style.height = `${height}px`;
    this.inputElement.style.fontSize = `${height * 0.9}px`;
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
