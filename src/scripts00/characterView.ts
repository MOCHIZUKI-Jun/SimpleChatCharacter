import * as Phaser from "phaser";
import {
  BODY_TEXTURE_KEY,
  DefineDepth,
  FACE_ATLAS_KEY,
  FACE_ATLAS_PART, HAIR_SIDE_L_TEXTURE_KEY, HAIR_SIDE_R_TEXTURE_KEY,
  MOUTH_TEXTURE_KEY,
  TAIL_TEXTURE_KEY
} from "./define.ts";
import {GetColorCodeByRGB} from "../utility/colorUtility.ts";
import {getWorldPos} from "../utility/transformUtility.ts";
import {waitMilliSeconds} from "../utility/asyncUtility.ts";
import {tweenAsync} from "../utility/tweenAsync.ts";
import {HairStripConfig, SingleColumnHairStrip} from "./singleColumnHairStrip.ts";

const ANCHOR_DEBUG_MODE = false;
const ANIMATION_DEBUG_MODE = false;

type Container = Phaser.GameObjects.Container;
type Rectangle = Phaser.GameObjects.Rectangle;
type Image = Phaser.GameObjects.Image;

/**
 * キャンセルトークン
 */
export class CancelContext {
  private _isCancelled = false;
  public get isCancelled() {
    return this._isCancelled;
  }
  
  public cancel() {
    this._isCancelled = true;
  }
}

/**
 * キャラクタービュー
 */
export class CharacterView extends Phaser.GameObjects.Container {

  private cancelContext : CancelContext;
  
  private containers: Container[] = [];
  private debugAnchors: Rectangle[] = [];
  
  // ルート
  private rootContainer!: Container;
  // 体の回転コンテナ
  private bodyRotateContainer!: Container;
  // 尻尾のコンテナ
  private tailContainer!: Container;
  // 尻尾のイメージ
  private tailImage!: Image;
  
  // 体のイメージ
  private bodyImage!: Image;
  // 頭前面のコンテナ
  private headFrontContainer!: Container;
  // 顔ベースのイメージ
  private faceBaseImage!: Image;
  // 頭背面のコンテナ
  private headBackContainer!: Container;
  // 後ろ髪のイメージ
  private hairBackImage!: Image;
  // 後ろ髪メッシュ
  private hairBackStrip!: SingleColumnHairStrip;
  // 右角のコンテナ
  private hornRightContainer!: Container;
  // 右角のイメージ
  private hornRightImage!: Image;
  // 左角のコンテナ
  private hornLeftContainer!: Container
  // 左角のイメージ
  private hornLeftImage!: Image;
  // 右横髪のコンテナ
  private hairSideRContainer!: Container;
  // 右横髪のイメージ
  private hairSideRImage!: Image;
  // 右横髪メッシュ
  private hairSideRStrip!: SingleColumnHairStrip;
  // 左横髪のコンテナ
  private hairSideLContainer!: Container
  // 左横髪のイメージ
  private hairSideLImage!: Image;
  // 左横髪メッシュ
  private hairSideLStrip!: SingleColumnHairStrip;
  // 前髪のイメージ
  private hairFrontImage!: Image;
  
  // 王冠のコンテナ
  private crownContainer!: Container;
  // 王冠のイメージ
  private crownImage!: Image;
  
  // 右目のコンテナ
  private eyeRightContainer!: Container;
  // 左目のコンテナ
  private eyeLeftContainer!: Container;
  // 右目のイメージ
  private eyeRightOpenImage!: Image;
  private eyeRightCloseImage!: Image;
  // 左目のイメージ
  private eyeLeftOpenImage!: Image;
  private eyeLeftCloseImage!: Image;
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
  private mouthOpenImage!: Image;
  private mouthCloseImage!: Image;
  
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
    
    this.hairSideRStrip.setEnable(true);
    this.hairSideLStrip.setEnable(true);
    this.hairBackStrip.setEnable(true);
    
    this.setEyes(true);
    this.setMouth(true);
    
    this.cancelContext = new CancelContext();
    this.playEyeBlinkLoopAsync(this.cancelContext).then();
    this.playSideShakeLoopAsync(this.cancelContext, 7, 1000).then();
    this.playTailShakeLoopAsync(this.cancelContext, 15, 800).then();
    //this.playTalkingLoopAsync(this.cancelContext).then();
    
    this.scene.events.on("update", () => {
      this.onUpdate(this.scene.game.loop.delta);
    });
    
    if (ANCHOR_DEBUG_MODE) this.showDebugAnchors();
    if (ANIMATION_DEBUG_MODE) this.playDebugAnimAsync().then();
  }
  
  /**
   * 現在のアニメーションを停止
   */
  public stopCurrentAnimation() {
    this.cancelContext.cancel();
  }
  
  /**
   * トークアニメーションループ
   */
  public async playTalkingLoopAsync(cancelContext: CancelContext) {
    this.playSingleTailShakeAsync().then();
    this.playSingleDownShakeAsync().then();
    while (!cancelContext.isCancelled) {
      await this.playSingleMouthOpenCloseAsync();
      await waitMilliSeconds(100);
    }
  }
  
  /**
   * 体を下に揺らして戻すアニメーションを再生
   */
  public async playSingleDownShakeAsync(durationMs: number = 200) {
    await tweenAsync(
      this.scene,
      {
        targets: this.rootContainer,
        y: 50,
        duration: durationMs,
        ease: "Sine.easeInOut",
      }
    );
    await tweenAsync(
      this.scene,
      {
        targets: this.rootContainer,
        y: 0,
        duration: durationMs,
        ease: "Sine.easeInOut",
      }
    );
  }
  
  /**
   * 尻尾を左右に揺らすループ
   */
  public async playTailShakeLoopAsync(cancelContext: CancelContext, degree: number, durationMs: number) {
    while (!cancelContext.isCancelled) {
      // 右へ
      await tweenAsync(
        this.scene,
        {
          targets: this.tailContainer,
          angle: degree,
          duration: durationMs * 0.5,
          ease: "Sine.easeInOut",
        }
      );
      // 左へ
      await tweenAsync(
        this.scene,
        {
          targets: this.tailContainer,
          angle: -degree,
          duration: durationMs,
          ease: "Sine.easeInOut",
        }
      );
    }
    // 中心へ
    await tweenAsync(
      this.scene,
      {
        targets: this.tailContainer,
        angle: 0,
        duration: durationMs * 0.5,
        ease: "Sine.easeInOut",
      }
    );
  }
  
  /**
   * 尻尾を一度だけ左右に揺らすアニメーションを再生
   */
  public playSingleTailShakeAsync(degree: number = 20, durationMs: number = 600) {
    return tweenAsync(
      this.scene,
      {
        targets: this.tailContainer,
        angle: degree,
        duration: durationMs * 0.5,
        ease: "Sine.easeInOut",
        yoyo: true,
      }
    );
  }
  
  /**
   * 体を左右に揺らすループ
   */
  public async playSideShakeLoopAsync(cancelContext: CancelContext, degree: number, durationMs: number) {
    // 右へ
    await tweenAsync(
      this.scene,
      {
        targets: this.bodyRotateContainer,
        angle: degree,
        duration: durationMs * 0.5,
        ease: "Sine.easeInOut",
      }
    );
    while (!cancelContext.isCancelled) {
      // 左へ
      await tweenAsync(
        this.scene,
        {
          targets: this.bodyRotateContainer,
          angle: -degree,
          duration: durationMs,
          ease: "Sine.easeInOut",
        }
      );
      // 右へ
      await tweenAsync(
        this.scene,
        {
          targets: this.bodyRotateContainer,
          angle: degree,
          duration: durationMs,
          ease: "Sine.easeInOut",
        }
      );
    }
    // 中心へ
    await tweenAsync(
      this.scene,
      {
        targets: this.bodyRotateContainer,
        angle: 0,
        duration: durationMs * 0.5,
        ease: "Sine.easeInOut",
      }
    );
  }
  
  /**
   * 待機用の目の開閉ループ
   */
  public async playEyeBlinkLoopAsync(cancelContext: CancelContext) {
    while (!cancelContext.isCancelled) {
      // 開いている時間
      await waitMilliSeconds(3000);
      // パチ
      await this.playSingleEyeBlinkAsync();
      // 開いている時間
      await waitMilliSeconds(2000);
      // パチ
      await this.playSingleEyeBlinkAsync();
      await waitMilliSeconds(100);
      // パチ
      await this.playSingleEyeBlinkAsync();
    }
  }
  
  /**
   * 目の瞬きアニメーション再生
   */
  public async playSingleEyeBlinkAsync() {
    // 目を閉じる
    this.setEyes(false);
    // 閉じている時間
    await waitMilliSeconds(100);
    // 目を開ける
    this.setEyes(true);
  }
  
  /**
   * 口の開閉アニメーション再生
   */
  public async playSingleMouthOpenCloseAsync() {
    // 口を閉じる
    this.setMouth(false);
    // 閉じている時間
    await waitMilliSeconds(100);
    // 口を開ける
    this.setMouth(true);
  }
  
  /**
   * 目の開閉
   */
  public setEyes(isOpen: boolean) {
    this.setEyeR(isOpen);
    this.setEyeL(isOpen);
  }
  
  /**
   * 右目の開閉
   */
  public setEyeR(isOpen: boolean) {
    this.eyeRightOpenImage.visible = isOpen;
    this.eyeRightCloseImage.visible = !isOpen;
  }
  
  /**
   * 左目の開閉
   */
  public setEyeL(isOpen: boolean) {
    this.eyeLeftOpenImage.visible = isOpen;
    this.eyeLeftCloseImage.visible = !isOpen;
  }
  
  /**
   * 口の開閉
   */
  public setMouth(isOpen: boolean) {
    this.mouthOpenImage.visible = isOpen;
    this.mouthCloseImage.visible = !isOpen;
  }
  
  /**
   * 首を回転
   */
  public rotateHead(degree: number) {
    const useDegree = Phaser.Math.Clamp(degree, -30, 30);
    const radian = Phaser.Math.DegToRad(useDegree);
    this.headFrontContainer.setRotation(radian);
    this.headBackContainer.setRotation(radian);
  }
  
  /**
   * 王冠を回転
   */
  public rotateCrown(degree: number) {
    const useDegree = Phaser.Math.Clamp(degree, -30, 30);
    const radian = Phaser.Math.DegToRad(useDegree);
    this.crownContainer.setRotation(radian);
  }
  
  /**
   * フレーム更新時
   */
  private onUpdate(_deltaTime: number) {
    // 体の回転に合わせて頭を傾ける
    const bodyRotationDeg = this.bodyRotateContainer.angle;
    const headRotationDeg = bodyRotationDeg * 0.96;
    this.rotateHead(headRotationDeg);
    const crownRotationDeg = bodyRotationDeg * 2.0;
    this.rotateCrown(crownRotationDeg);
  }
  
  /**
   * 作成
   */
  private create() {
    // ルートコンテナ
    this.rootContainer = this.createContainer(0, 0);
    
    const tailScale = 0.8;
    const bodyScale = 0.55;
    const hairBackScale = 0.8;
    const faceScale = 0.8;
    const hornScale = 0.8;
    const hairSideScale = 0.8;
    const hairFrontScale = 0.82;
    const crownScale = 0.7;
    const eyeScale = 0.66;
    const eyeCloseScale = 0.76;
    const mouthScale = 0.6;
    const mouthCloseScale = 0.7;
    
    // 体回転コンテナ
    this.bodyRotateContainer = this.createContainer(0, 500);
    this.rootContainer.add(this.bodyRotateContainer);
    
    // 尻尾コンテナ
    this.tailContainer = this.createContainer(150, -60);
    this.bodyRotateContainer.add(this.tailContainer);
    
    // 尻尾イメージ
    this.tailImage = this.scene.add.image(50, -130, TAIL_TEXTURE_KEY);
    this.tailImage.setScale(tailScale);
    this.tailContainer.add(this.tailImage);

    // 頭背面コンテナ
    this.headBackContainer = this.createContainer(0, -540);
    this.bodyRotateContainer.add(this.headBackContainer);
    
    // 後ろ髪イメージ
    this.hairBackImage = this.scene.add.image(10, -20, FACE_ATLAS_KEY, FACE_ATLAS_PART.HAIR_BACK);
    
    // 後ろ髪メッシュ
    const hairBackImageTextureWidth = this.hairBackImage.width * hairBackScale;
    const hairBackImageTextureHeight = this.hairBackImage.height * hairBackScale;
    this.hairBackStrip = new SingleColumnHairStrip(
      this.scene,
      FACE_ATLAS_KEY,
      5,
      hairBackImageTextureWidth,
      hairBackImageTextureHeight,
      new HairStripConfig(
        0.08, 0.05, 3
      ),
      FACE_ATLAS_PART.HAIR_BACK
    );
    this.hairBackStrip.setPosition(10, -20);
    this.headBackContainer.add(this.hairBackStrip);

    //this.hairBackImage.setScale(hairBackScale);
    //this.headBackContainer.add(this.hairBackImage);
    this.hairBackImage.setVisible(false);
    
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
    
    // 右角コンテナ
    this.hornRightContainer = this.createContainer(110, -210);
    this.headFrontContainer.add(this.hornRightContainer);
    
    // 右角イメージ
    this.hornRightImage = this.scene.add.image(0, -30, FACE_ATLAS_KEY, FACE_ATLAS_PART.HORN_RIGHT);
    this.hornRightImage.setScale(hornScale);
    this.hornRightContainer.add(this.hornRightImage);
    
    // 左角コンテナ
    this.hornLeftContainer = this.createContainer(-110, -210);
    this.headFrontContainer.add(this.hornLeftContainer);
    
    // 左角イメージ
    this.hornLeftImage = this.scene.add.image(0, -30, FACE_ATLAS_KEY, FACE_ATLAS_PART.HORN_LEFT);
    this.hornLeftImage.setScale(hornScale);
    this.hornLeftContainer.add(this.hornLeftImage);
    
    // 右横髪コンテナ
    this.hairSideRContainer = this.createContainer(125, -80);
    this.headFrontContainer.add(this.hairSideRContainer);
    
    // 右横髪イメージ
    this.hairSideRImage = this.scene.add.image(20, 100, HAIR_SIDE_R_TEXTURE_KEY);

    // 右横髪メッシュ
    const hairSideRImageTextureWidth = this.hairSideRImage.width * hairSideScale;
    const hairSideRImageTextureHeight = this.hairSideRImage.height * hairSideScale;
    this.hairSideRStrip = new SingleColumnHairStrip(
      this.scene,
      HAIR_SIDE_R_TEXTURE_KEY,
      5,
      hairSideRImageTextureWidth,
      hairSideRImageTextureHeight,
      new HairStripConfig(
        0.02, 0.2, 0
      ),
    );
    this.hairSideRStrip.setPosition(20, 100);
    this.hairSideRContainer.add(this.hairSideRStrip);
    
    //this.hairSideRImage.setScale(hairSideScale);
    //this.hairSideRContainer.add(this.hairSideRImage);
    this.hairSideRImage.setVisible(false);
    
    
    // 左横髪コンテナ
    this.hairSideLContainer = this.createContainer(-135, -80);
    this.headFrontContainer.add(this.hairSideLContainer);
    // 左横髪イメージ
    this.hairSideLImage = this.scene.add.image(-20, 100, HAIR_SIDE_L_TEXTURE_KEY);
    
    // 左横髪メッシュ
    const hairSideLImageTextureWidth = this.hairSideLImage.width * hairSideScale;
    const hairSideLImageTextureHeight = this.hairSideLImage.height * hairSideScale;
    this.hairSideLStrip = new SingleColumnHairStrip(
      this.scene,
      HAIR_SIDE_L_TEXTURE_KEY,
      5,
      hairSideLImageTextureWidth,
      hairSideLImageTextureHeight,
      new HairStripConfig(
        0.02, 0.2, 0
      ),
    );
    this.hairSideLStrip.setPosition(-20, 100);
    this.hairSideLContainer.add(this.hairSideLStrip);
    
    //this.hairSideLImage.setScale(hairSideScale);
    //this.hairSideLContainer.add(this.hairSideLImage);
    this.hairSideLImage.setVisible(false);
    
    // 前髪イメージ
    this.hairFrontImage = this.scene.add.image(0, -148, FACE_ATLAS_KEY, FACE_ATLAS_PART.HAIR_FRONT);
    this.hairFrontImage.setScale(hairFrontScale);
    this.headFrontContainer.add(this.hairFrontImage);
    
    // 王冠コンテナ
    this.crownContainer = this.createContainer(0, -220);
    this.headFrontContainer.add(this.crownContainer);
    // 王冠イメージ
    this.crownImage = this.scene.add.image(0, -75, FACE_ATLAS_KEY, FACE_ATLAS_PART.CROWN);
    this.crownImage.setScale(crownScale);
    this.crownContainer.add(this.crownImage);
    
    // 右目コンテナ
    this.eyeRightContainer = this.createContainer(66, -78);
    this.headFrontContainer.add(this.eyeRightContainer);
    
    // 左目コンテナ
    this.eyeLeftContainer = this.createContainer(-66, -78);
    this.headFrontContainer.add(this.eyeLeftContainer);
    
    // 右目イメージ
    this.eyeRightOpenImage = this.scene.add.image(0, 0, FACE_ATLAS_KEY, FACE_ATLAS_PART.EYE_RIGHT_OPEN);
    this.eyeRightOpenImage.setScale(eyeScale);
    this.eyeRightContainer.add(this.eyeRightOpenImage);
    // 閉
    this.eyeRightCloseImage = this.scene.add.image(-3, 6, FACE_ATLAS_KEY, FACE_ATLAS_PART.EYE_RIGHT_CLOSED);
    this.eyeRightCloseImage.setScale(eyeCloseScale);
    this.eyeRightContainer.add(this.eyeRightCloseImage);
    
    // 左目イメージ
    this.eyeLeftOpenImage = this.scene.add.image(0, 0, FACE_ATLAS_KEY, FACE_ATLAS_PART.EYE_LEFT_OPEN);
    this.eyeLeftOpenImage.setScale(eyeScale);
    this.eyeLeftContainer.add(this.eyeLeftOpenImage);
    // 閉
    this.eyeLeftCloseImage = this.scene.add.image(3, 6, FACE_ATLAS_KEY, FACE_ATLAS_PART.EYE_LEFT_CLOSED);
    this.eyeLeftCloseImage.setScale(eyeCloseScale);
    this.eyeLeftContainer.add(this.eyeLeftCloseImage);
    
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
    this.mouthOpenImage = this.scene.add.image(0, 0, MOUTH_TEXTURE_KEY);
    this.mouthOpenImage.setScale(mouthScale);
    this.mouthContainer.add(this.mouthOpenImage);
    // 閉
    this.mouthCloseImage = this.scene.add.image(0, 2, FACE_ATLAS_KEY, FACE_ATLAS_PART.MOUTH_CLOSED);
    this.mouthCloseImage.setScale(mouthCloseScale);
    this.mouthContainer.add(this.mouthCloseImage);
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
   * デバッグ用アニメーション再生
   */
  private async playDebugAnimAsync() {
    console.log("CharacterView: playDebugAnim");

    await waitMilliSeconds(1000);
    for (let i = 0; i < 10; i++) {
      await this.playSingleMouthOpenCloseAsync();
      await waitMilliSeconds(100);
    }
    
    this.cancelContext?.cancel();
    
    /*
    for (let i = 0; i < 10; i++) {
      await waitMilliSeconds(1000);
      this.setEyes(false);
      await waitMilliSeconds(1000);
      this.setEyes(true);
    }
    */
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