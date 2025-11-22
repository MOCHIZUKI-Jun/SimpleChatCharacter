import Phaser from 'phaser';
import {createConfig} from "../define.ts";
import {AssetLoader} from "../utility/assetLoader.ts";
import {
  BACKGROUND_COLOR, BODY_TEXTURE_KEY, BODY_TEXTURE_PATH,
  DefineDepth, FACE_ATLAS_JSON_PATH,
  FACE_ATLAS_KEY, FACE_ATLAS_PATH,
  LABEL_TEXT_COLOR,
  LABEL_TEXT_SIZE, MOUTH_TEXTURE_KEY, MOUTH_TEXTURE_PATH, TAIL_TEXTURE_KEY, TAIL_TEXTURE_PATH,
  TITLE,
} from "./define.ts";
import {BackgroundView} from "../commonViews/backgroundView.ts";
import {TextLabel} from "../commonViews/textLabel.ts";
import {FpsView} from "../commonViews/fpsView.ts";
import {SimpleDisposableInterface} from "../utility/simpleDisposableInterface.ts";
import {CharacterView} from "./characterView.ts";


/**
 * SummaryScene
 */
export class SummaryScene extends Phaser.Scene {

  // シーンキー
  public static Key = 'SummaryScene';
  
  // キャラクタービュー
  private characterView!: CharacterView;
  // テキストラベル
  private textLabel!: TextLabel;

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
    this.load.image(BODY_TEXTURE_KEY, BODY_TEXTURE_PATH);
    this.load.image(MOUTH_TEXTURE_KEY, MOUTH_TEXTURE_PATH);
    this.load.image(TAIL_TEXTURE_KEY, TAIL_TEXTURE_PATH);
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

    const canvas = this.game.canvas;

    // 背景
    new BackgroundView(this, BACKGROUND_COLOR);
    // テキストラベル
    this.textLabel = new TextLabel(this, LABEL_TEXT_COLOR, 1, LABEL_TEXT_SIZE);
    this.textLabel.setPosition(canvas.width/2, canvas.height * 0.95);
    this.textLabel.setDepth(DefineDepth.UI);
    this.textLabel.setTextAsync(TITLE).then();
    
    // キャラクタービューを追加
    this.characterView = new CharacterView(this);
    
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