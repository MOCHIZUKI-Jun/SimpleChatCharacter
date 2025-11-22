import * as Phaser from "phaser";
import {BODY_TEXTURE_KEY, DefineDepth, FACE_ATLAS_KEY, FACE_ATLAS_PART, MOUTH_TEXTURE_KEY} from "./define.ts";
import {GetColorCodeByRGB} from "../utility/colorUtility.ts";
import {getWorldPos} from "../utility/transformUtility.ts";

const DEBUG_MODE = false;

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
  // 前髪のイメージ
  private hairFrontImage!: Image;
  // 右目のコンテナ
  private eyeRightContainer!: Container;
  // 左目のコンテナ
  private eyeLeftContainer!: Container;
  // 右目のイメージ
  private eyeRightImage!: Image;
  // 左目のイメージ
  private eyeLeftImage!: Image;
  // 右眉のコンテナ
  private browRightContainer!: Container;
  // 左眉のコンテナ
  private browLeftContainer!: Container;
  // 右眉のイメージ
  private browRightImage!: Image;
  // 左眉のイメージ
  private browLeftImage!: Image;
  // 口のコンテナ
  private mouthContainer!: Container;
  // 口のイメージ
  private mouthImage!: Image;
  
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
    
    const bodyScale = 0.55;
    const hairBackScale = 0.8;
    const faceScale = 0.8;
    const hairFrontScale = 0.8;
    const eyeScale = 0.66;
    const mouthScale = 0.6;
    
    // 体回転コンテナ
    this.bodyRotateContainer = this.createContainer(0, 500);
    this.rootContainer.add(this.bodyRotateContainer);

    // 頭背面コンテナ
    this.headBackContainer = this.createContainer(0, -540);
    this.bodyRotateContainer.add(this.headBackContainer);
    // 後ろ髪イメージ
    this.hairBackImage = this.scene.add.image(10, -20, FACE_ATLAS_KEY, FACE_ATLAS_PART.HAIR_BACK);
    this.hairBackImage.setScale(hairBackScale);
    this.headBackContainer.add(this.hairBackImage);
    
    // 体イメージ
    this.bodyImage = this.scene.add.image(0, -240, BODY_TEXTURE_KEY);
    this.bodyImage.setScale(bodyScale);
    this.bodyRotateContainer.add(this.bodyImage);
    
    // 頭前面コンテナ
    this.headFrontContainer = this.createContainer(0, -540);
    this.bodyRotateContainer.add(this.headFrontContainer);
    
    // 顔ベースイメージ
    this.faceBaseImage = this.scene.add.image(0, -100, FACE_ATLAS_KEY, FACE_ATLAS_PART.FACE_BASE);
    this.faceBaseImage.setScale(faceScale);
    this.headFrontContainer.add(this.faceBaseImage);
    
    // 前髪イメージ
    this.hairFrontImage = this.scene.add.image(0, -146, FACE_ATLAS_KEY, FACE_ATLAS_PART.HAIR_FRONT);
    this.hairFrontImage.setScale(hairFrontScale);
    this.headFrontContainer.add(this.hairFrontImage);
    
    // 右目コンテナ
    this.eyeRightContainer = this.createContainer(66, -78);
    this.headFrontContainer.add(this.eyeRightContainer);
    
    // 左目コンテナ
    this.eyeLeftContainer = this.createContainer(-66, -78);
    this.headFrontContainer.add(this.eyeLeftContainer);
    
    // 右目イメージ
    this.eyeRightImage = this.scene.add.image(0, 0, FACE_ATLAS_KEY, FACE_ATLAS_PART.EYE_RIGHT_OPEN);
    this.eyeRightImage.setScale(eyeScale);
    this.eyeRightContainer.add(this.eyeRightImage);
    
    // 左目イメージ
    this.eyeLeftImage = this.scene.add.image(0, 0, FACE_ATLAS_KEY, FACE_ATLAS_PART.EYE_LEFT_OPEN);
    this.eyeLeftImage.setScale(eyeScale);
    this.eyeLeftContainer.add(this.eyeLeftImage);
    
    // 右眉コンテナ
    this.browRightContainer = this.createContainer(60, -130);
    this.headFrontContainer.add(this.browRightContainer);
    
    // 左眉コンテナ
    this.browLeftContainer = this.createContainer(-60, -130);
    this.headFrontContainer.add(this.browLeftContainer);
    
    // 右眉イメージ
    this.browRightImage = this.scene.add.image(0, 0, FACE_ATLAS_KEY, FACE_ATLAS_PART.EYEBROW_RIGHT);
    this.browRightImage.setScale(eyeScale);
    this.browRightContainer.add(this.browRightImage);
    
    // 左眉イメージ
    this.browLeftImage = this.scene.add.image(0, 0, FACE_ATLAS_KEY, FACE_ATLAS_PART.EYEBROW_LEFT);
    this.browLeftImage.setScale(eyeScale);
    this.browLeftContainer.add(this.browLeftImage);
    
    // 口コンテナ
    this.mouthContainer = this.createContainer(0, 0);
    this.headFrontContainer.add(this.mouthContainer);
    
    // 口イメージ
    this.mouthImage = this.scene.add.image(0, 0, MOUTH_TEXTURE_KEY);
    this.mouthImage.setScale(mouthScale);
    this.mouthContainer.add(this.mouthImage);
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