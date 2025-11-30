import Phaser from 'phaser';
import {createConfig} from "../define.ts";
import {AssetLoader} from "../utility/assetLoader.ts";
import {
  BACKGROUND_COLOR,
  BODY_TEXTURE_KEY,
  BODY_TEXTURE_PATH, DefineDepth,
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
  TAIL_TEXTURE_PATH,
  TEXT_COLOR,
  VERSION_TEXT,
} from "./define.ts";
import {BackgroundView} from "../commonViews/backgroundView.ts";
import {FpsView} from "../commonViews/fpsView.ts";
import {SimpleDisposableInterface} from "../utility/simpleDisposableInterface.ts";
import {CharacterView} from "./characterView.ts";
import {InputFieldView} from "./inputFieldView.ts";
import {MessageViewSystem} from "./messageViewSystem.ts";
import {SimpleMessageBroker} from "../utility/simpleMessageBroker.ts";
import {CuteMockLLMClientApi} from "./cuteMockLLMClientApi.ts";
import {CharacterViewSystem} from "./characterViewSystem.ts";
import {TextLabel} from "../commonViews/textLabel.ts";


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
  
  private messageViewSystem!: MessageViewSystem;
  private characterViewSystem!: CharacterViewSystem;

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
    
    // メッセージブローカ
    const messageBroker = new SimpleMessageBroker();
    // モックAPIクライアント
    const mockApiClient = new CuteMockLLMClientApi();
    
    // 背景
    new BackgroundView(this, BACKGROUND_COLOR);
    // キャラクタービューを追加
    this.characterView = new CharacterView(this);
    // テキスト入力ビューを追加
    this.inputFieldView = new InputFieldView(this);
    // FPS表示
    new FpsView(this);
    // バージョンラベル
    const versionLabel = new TextLabel(
      this,
      TEXT_COLOR,
      1,
      20
    );
    versionLabel.setText(VERSION_TEXT);
    versionLabel.setDepth(DefineDepth.UI);
    const versionTextSize = versionLabel.getTextDisplaySize();
    versionLabel.setPosition(
      versionTextSize.width/2 + 10,
      versionTextSize.height/2 + 40
    );
    
    // キャラ表示システム
    this.characterViewSystem = new CharacterViewSystem(
      messageBroker,
      this.characterView,
    );
    // メッセージ表示システム
    this.messageViewSystem = new MessageViewSystem(
      this,
      messageBroker,
      this.inputFieldView,
      mockApiClient,
    );
  }
  
  public dispose() {
    this.disposables.forEach(d => d.dispose());
    this.characterView.dispose();
    this.characterViewSystem.dispose();
    this.messageViewSystem.dispose();
  }
  
  /**
   * フレーム更新
   */
  update() {
    if (!this.isShow) return;
  }
}

new Phaser.Game(createConfig([SummaryScene, AssetLoader]));