import * as Phaser from "phaser";
import {BODY_TEXTURE_KEY, DefineDepth, FACE_ATLAS_KEY, FACE_ATLAS_PART} from "./define.ts";
import {GetColorCodeByRGB} from "../utility/colorUtility.ts";
import {getWorldPos} from "../utility/transformUtility.ts";

const DEBUG_MODE = true;

type Container = Phaser.GameObjects.Container;
type Rectangle = Phaser.GameObjects.Rectangle;
type Image = Phaser.GameObjects.Image;

/**
 * キャラクタービュー
 */
export class CharacterView extends Phaser.GameObjects.Container {

  private containers: Container[] = [];
  private debugAnchors: Rectangle[] = [];
  
  // ルート
  private rootContainer!: Container;
  // 体の回転コンテナ
  private bodyRotateContainer!: Container;
  // 体のイメージ
  private bodyImage!: Image;
  // 頭前面のコンテナ
  private headFrontContainer!: Container;
  // 顔ベースのイメージ
  private faceBaseImage!: Image;
  // 頭背面のコンテナ
  private headBackContainer!: Container;
  // 後ろ髪のイメージ
  private hairBackImage!: Image
  
  /**
   * コンストラクタ
   */
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setDepth(DefineDepth.CHARACTER);
    const canvas = scene.sys.game.canvas;
    this.setPosition(canvas.width/2, canvas.height/2);
    
    this.create();
    
    if (DEBUG_MODE) {
      this.showDebugAnchors();
    }
  }
  
  /**
   * 作成
   */
  private create() {
    // ルートコンテナ
    this.rootContainer = this.createContainer(0, 0);
    
    const bodyScale = 0.6;
    const hearBackScale = 0.8;
    const faceScale = 0.8;
    
    // 体回転コンテナ
    this.bodyRotateContainer = this.createContainer(0, 500);
    this.rootContainer.add(this.bodyRotateContainer);

    // 頭背面コンテナ
    this.headBackContainer = this.createContainer(0, -570);
    this.bodyRotateContainer.add(this.headBackContainer);
    this.hairBackImage = this.scene.add.image(10, -20, FACE_ATLAS_KEY, FACE_ATLAS_PART.HAIR_BACK);
    this.hairBackImage.setScale(hearBackScale);
    this.headBackContainer.add(this.hairBackImage);
    
    // 体イメージ
    this.bodyImage = this.scene.add.image(0, -240, BODY_TEXTURE_KEY);
    this.bodyImage.setScale(bodyScale);
    this.bodyRotateContainer.add(this.bodyImage);
    
    // 頭前面コンテナ
    this.headFrontContainer = this.createContainer(0, -570);
    this.bodyRotateContainer.add(this.headFrontContainer);
    this.faceBaseImage = this.scene.add.image(0, -100, FACE_ATLAS_KEY, FACE_ATLAS_PART.FACE_BASE);
    this.faceBaseImage.setScale(faceScale);
    this.headFrontContainer.add(this.faceBaseImage);
  }
  
  /**
   * 破棄
   */
  public dispose() {}
  
  /**
   * コンテナを作成する・配列に保持
   */
  private createContainer(x: number, y: number) {
    const container = this.scene.add.container(x, y);
    this.containers.push(container);
    this.add(container);
    return container;
  }
  
  /**
   * アンカーをデバッグ表示
   */
  private showDebugAnchors() {
    console.log("CharacterView: showDebugAnchors");
    
    // コンテナ分デバッグ表示を追加
    for (let i = 0; i < this.containers.length; i++) {
      const color = GetColorCodeByRGB(255, 0, 255);
      const anchor = this.scene.add.rectangle(0, 0, 20, 20, color, 0.5);
      anchor.setDepth(DefineDepth.DEBUG_ANCHOR);
      this.debugAnchors.push(anchor);
    }

    this.scene.events.on("update", () => {
      for (let i = 0; i < this.containers.length; i++) {
        const container = this.containers[i];
        const worldPos = getWorldPos(container);
        this.debugAnchors[i].setPosition(
          worldPos.x,
          worldPos.y,
        );
      }
    });
  }
  
}