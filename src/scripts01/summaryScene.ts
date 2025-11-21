import Phaser from 'phaser';
import {createConfig} from "../define.ts";
import {
  BACKGROUND_COLOR, DefineDepth, LABEL_TEXT_SIZE, TITLE,
  SAMPLE_IMAGE_PATH,
} from "./define.ts";
import {BackgroundView} from "../commonViews/backgroundView.ts";
import {FpsView} from "../commonViews/fpsView.ts";
import {isLocalhost} from "../utility/localhostUtility.ts";
import {SimpleDisposableInterface} from "../utility/simpleDisposableInterface.ts";
import {TextLabel} from "../commonViews/textLabel.ts";
import {LABEL_TEXT_COLOR} from "../scripts00/define.ts";

const SAMPLE_IMAGE_KEY = 'sample-image';


/**
 * SummaryScene
 */
export class SummaryScene extends Phaser.Scene {

  // シーンキー
  public static Key = 'SummaryScene';

  // テキストラベル
  private textLabel!: TextLabel;

  // 表示フラグ
  private isShow = false;

  private sampleImage?: Phaser.GameObjects.Image;

  private readonly disposables: SimpleDisposableInterface[] = [];

  /**
   * ChatGPT: コンストラクタ
   */
  constructor() {
    super(SummaryScene.Key);
    console.log('SummaryScene constructor');
  }

  /**
   * ChatGPT: プリロード
   */
  preload() {
    console.log('SummaryScene preload');

    // ChatGPT: サンプル画像を標準ロードで読み込む
    this.load.image(SAMPLE_IMAGE_KEY, SAMPLE_IMAGE_PATH);
  }

  /**
   * ChatGPT: ゲームオブジェクト初期化
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
    this.showSampleImage();
    // テキストラベル
    this.textLabel = new TextLabel(this, LABEL_TEXT_COLOR, 1, LABEL_TEXT_SIZE);
    this.textLabel.setPosition(canvas.width/2, canvas.height * 0.95);
    this.textLabel.setDepth(DefineDepth.UI);
    this.textLabel.setTextAsync(TITLE).then();

    // FPS表示
    if (isLocalhost()) new FpsView(this);
  }

  /**
   * ChatGPT: 破棄処理
   */
  public dispose() {
    this.disposables.forEach(d => d.dispose());
  }

  /**
   * ChatGPT: フレーム更新
   */
  update() {
    if (!this.isShow) return;
  }

  /**
   * ChatGPT: サンプル画像を中央に表示する
   */
  private showSampleImage() {
    // ChatGPT: 画像がロード済みか確認してから配置する
    if (!this.textures.exists(SAMPLE_IMAGE_KEY)) {
      console.log('sample image texture missing');
      return;
    }

    const canvas = this.game.canvas;
    this.sampleImage = this.add.image(canvas.width / 2, canvas.height / 2, SAMPLE_IMAGE_KEY);
    this.sampleImage.setDepth(DefineDepth.UI - 1);
    this.sampleImage.setOrigin(0.5, 0.5);
  }
}
new Phaser.Game(createConfig([SummaryScene]));
