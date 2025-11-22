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

  private hairMesh?: Phaser.GameObjects.Mesh;

  // ChatGPT: 論理頂点の基準座標
  private meshBaseVertices: Phaser.Math.Vector3[] = [];

  // ChatGPT: 実頂点から論理頂点への対応インデックス
  private meshVertexLogicalIndices: number[] = [];

  private readonly meshColumns = 1;

  private readonly meshRows = 5;

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

    // ChatGPT: サンプル画像を標準ロードで読み込む
    this.load.image(SAMPLE_IMAGE_KEY, SAMPLE_IMAGE_PATH);
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
    this.showSampleMesh();
    // テキストラベル
    this.textLabel = new TextLabel(this, LABEL_TEXT_COLOR, 1, LABEL_TEXT_SIZE);
    this.textLabel.setPosition(canvas.width/2, canvas.height * 0.95);
    this.textLabel.setDepth(DefineDepth.UI);
    this.textLabel.setTextAsync(TITLE).then();

    // FPS表示
    if (isLocalhost()) new FpsView(this);
  }

  public dispose() {
    this.disposables.forEach(d => d.dispose());
  }

  /**
   * フレーム更新
   */
  update() {
    if (!this.isShow || !this.hairMesh) return;

    // GPT-5.1-Codex-Max: 頂点を時間経過で揺らす
    const time = this.time.now;
    // GPT-5.1-Codex-Max: 波速と振幅を強め、時間で変化する揺れ幅を与える
    const waveSpeed = 0.0065;
    const amplitude = 20;
    const amplitudePulse = 1 + 0.3 * Math.sin(time * 0.002);
    const verticesPerRow = this.meshColumns + 1;

    this.hairMesh.vertices.forEach((vertex, index) => {
      const logicalIndex = this.meshVertexLogicalIndices[index];
      const base = this.meshBaseVertices[logicalIndex];
      if (!base) return;

      const rowIndex = Math.floor(logicalIndex / verticesPerRow);
      const progress = rowIndex / this.meshRows;
      const sway = Math.sin(time * waveSpeed + rowIndex * 0.9) * amplitude * amplitudePulse * progress;
      const lift = Math.cos(time * waveSpeed * 0.95 + rowIndex * 0.5) * 4 * (1 - progress) * amplitudePulse;

      vertex.x = base.x + sway;
      vertex.y = base.y + lift;
    });
    // GPT-5.1-Codex-Max: 頂点更新を描画に反映させる
    this.hairMesh.setDirty();
  }

  /**
   * ChatGPT: サンプル画像に髪の毛風のメッシュを適用する
   */
  private showSampleMesh() {
    // ChatGPT: 1列x5行のメッシュを生成して配置する
    const {centerX, centerY} = this.cameras.main;
    const meshWidth = 300;
    const meshHeight = 300;
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const logicalVertices: Phaser.Math.Vector3[] = [];

    for (let row = 0; row <= this.meshRows; row++) {
      const v = row / this.meshRows;
      const y = Phaser.Math.Linear(-meshHeight / 2, meshHeight / 2, v);

      for (let col = 0; col <= this.meshColumns; col++) {
        const u = col / this.meshColumns;
        const x = Phaser.Math.Linear(-meshWidth / 2, meshWidth / 2, u);

        vertices.push(x, y);
        // GPT-5.1-Codex-Max: Mesh の UV は v=0 が下になるため、上下反転を防ぐために v を反転する
        const flippedV = 1 - v;
        uvs.push(u, flippedV);
        logicalVertices.push(new Phaser.Math.Vector3(x, y, 0));
      }
    }

    for (let row = 0; row < this.meshRows; row++) {
      for (let col = 0; col < this.meshColumns; col++) {
        const topLeft = row * (this.meshColumns + 1) + col;
        const topRight = topLeft + 1;
        const bottomLeft = (row + 1) * (this.meshColumns + 1) + col;
        const bottomRight = bottomLeft + 1;

        indices.push(topLeft, bottomLeft, topRight);
        indices.push(topRight, bottomLeft, bottomRight);
      }
    }

    this.hairMesh = this.add.mesh(centerX, centerY, SAMPLE_IMAGE_KEY);
    this.hairMesh.setDepth(DefineDepth.UI - 1);
    this.hairMesh.hideCCW = false;
    this.hairMesh.addVertices(vertices, uvs, indices);
    this.hairMesh.setOrtho(meshWidth, meshHeight);
    // GPT-5.1-Codex-Max: 論理頂点の基準座標と対応インデックスを保持する
    this.meshBaseVertices = logicalVertices;
    this.meshVertexLogicalIndices = Array.from({length: logicalVertices.length}, (_, i) => i);
    this.isShow = true;
  }
}
new Phaser.Game(createConfig([SummaryScene]));
