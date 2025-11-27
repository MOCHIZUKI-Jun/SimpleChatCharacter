import Phaser from 'phaser';
import {createConfig} from "../define.ts";
import {AssetLoader} from "../utility/assetLoader.ts";
import {
  BACKGROUND_COLOR,
  BODY_TEXTURE_KEY,
  BODY_TEXTURE_PATH,
  FACE_ATLAS_JSON_PATH,
  FACE_ATLAS_KEY,
  FACE_ATLAS_PATH,
  HAIR_SIDE_L_TEXTURE_KEY,
  HAIR_SIDE_L_TEXTURE_PATH,
  HAIR_SIDE_R_TEXTURE_KEY,
  HAIR_SIDE_R_TEXTURE_PATH,
  MESSAGE_FLIP_TEXTURE_KEY,
  MESSAGE_FLIP_TEXTURE_PATH,
  MESSAGE_TEXTURE_KEY,
  MESSAGE_TEXTURE_PATH,
  MOUTH_TEXTURE_KEY,
  MOUTH_TEXTURE_PATH,
  TAIL_TEXTURE_KEY,
  TAIL_TEXTURE_PATH, TEXT_SIZE,
} from "./define.ts";
import {BackgroundView} from "../commonViews/backgroundView.ts";
import {FpsView} from "../commonViews/fpsView.ts";
import {SimpleDisposableInterface} from "../utility/simpleDisposableInterface.ts";
import {CharacterView} from "./characterView.ts";
import {InputFieldView} from "./inputFieldView.ts";
import {MessageView} from "./messageView.ts";
import {GetColorCodeByRGB} from "../utility/colorUtility.ts";


/**
 * SummaryScene
 */
export class SummaryScene extends Phaser.Scene {

  // シーンキー
  public static Key = 'SummaryScene';
  
  // キャラクタービュー
  private characterView!: CharacterView;
  // テキスト入力ビュー
  private inputFieldView!: InputFieldView;

  // 表示フラグ
  private isShow = false;

  private readonly disposables: SimpleDisposableInterface[] = [];
  
  /**
   * コンストラクタ
   */
  constructor() {
    super(SummaryScene.Key);
    console.log('SummaryScene constructor');
  }

  /**
   * プリロード
   */
  preload() {
    console.log('SummaryScene preload');

    this.load.atlas(FACE_ATLAS_KEY, FACE_ATLAS_PATH, FACE_ATLAS_JSON_PATH);
    this.load.image(HAIR_SIDE_L_TEXTURE_KEY, HAIR_SIDE_L_TEXTURE_PATH);
    this.load.image(HAIR_SIDE_R_TEXTURE_KEY, HAIR_SIDE_R_TEXTURE_PATH);
    this.load.image(BODY_TEXTURE_KEY, BODY_TEXTURE_PATH);
    this.load.image(MOUTH_TEXTURE_KEY, MOUTH_TEXTURE_PATH);
    this.load.image(TAIL_TEXTURE_KEY, TAIL_TEXTURE_PATH);
    this.load.image(MESSAGE_TEXTURE_KEY, MESSAGE_TEXTURE_PATH);
    this.load.image(MESSAGE_FLIP_TEXTURE_KEY, MESSAGE_FLIP_TEXTURE_PATH);
  }

  /**
   * ゲームオブジェクト初期化
   */
  create() {
    console.log('SummaryScene create');

    // URLからパラメータを取得
    const params = new URLSearchParams(window.location.search);
    const idx = params.get('idx');
    console.log(`idx: ${idx}`);
    
    // 背景
    new BackgroundView(this, BACKGROUND_COLOR);
    // テキストラベル
    //this.textLabel = new TextLabel(this, LABEL_TEXT_COLOR, 1, LABEL_TEXT_SIZE);
    //this.textLabel.setPosition(canvas.width/2, canvas.height * 0.95);
    //this.textLabel.setDepth(DefineDepth.UI);
    //this.textLabel.setTextAsync(TITLE).then();
    
    // キャラクタービューを追加
    this.characterView = new CharacterView(this);
    
    // テキスト入力ビューを追加
    this.inputFieldView = new InputFieldView(this);
    
    const test = new MessageView(this, TEXT_SIZE, 400, 4, false, GetColorCodeByRGB(200,200,200));
    test.setPosition(500,500);
    const test2 = new MessageView(this, TEXT_SIZE, 400, 4, true, GetColorCodeByRGB(200,200,200));
    test2.setPosition(800,700);
    
    // FPS表示
    new FpsView(this);
  }
  
  public dispose() {
    this.disposables.forEach(d => d.dispose());
    this.characterView.dispose();
  }
  
  /**
   * フレーム更新
   */
  update() {
    if (!this.isShow) return;
  }
}

new Phaser.Game(createConfig([SummaryScene, AssetLoader]));