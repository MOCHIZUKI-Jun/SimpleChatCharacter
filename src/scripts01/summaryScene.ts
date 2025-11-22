import Phaser from 'phaser';
import {createConfig} from "../define.ts";
import {
  BACKGROUND_COLOR,
  DefineDepth,
  FACE_ATLAS_PATH,
  FACE_SHEET_PATH,
  LABEL_TEXT_SIZE,
  SAMPLE_IMAGE_PATH,
  TITLE,
} from "./define.ts";
import {BackgroundView} from "../commonViews/backgroundView.ts";
import {FpsView} from "../commonViews/fpsView.ts";
import {SimpleDisposableInterface} from "../utility/simpleDisposableInterface.ts";
import {TextLabel} from "../commonViews/textLabel.ts";
import {LABEL_TEXT_COLOR} from "../scripts00/define.ts";

const SAMPLE_IMAGE_KEY = 'sample-image';
const FACE_ATLAS_KEY = 'image-face03';

type Vertex = Phaser.Geom.Mesh.Vertex;

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
  
  private sampleImageSize = { width: 300, height: 300 };
  private sampleImagePosition = { x: 200, y: 200 };

  // ChatGPT: 髪の毛メッシュ
  private hairMesh?: Phaser.GameObjects.Mesh;
  // ChatGPT: 論理頂点の基準座標
  //private meshBaseVertices: Phaser.Math.Vector3[] = [];
  // ChatGPT: 実頂点から論理頂点への対応インデックス
  //private meshVertexLogicalIndices: number[] = [];
  private vertices!: Vertex[];
  private baseVerts!: { x: number; y: number }[];
  private rootToTip!: number[]; // 0.0 = 根本, 1.0 = 先端

  private character!: Phaser.GameObjects.Container;
  private prevCharX = 0;
  private timeSec = 0;

  private faceImage?: Phaser.GameObjects.Image;
  

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
    // ChatGPT: 顔テクスチャアトラスをロード（画像とJSONを一緒に）
    this.load.atlas(FACE_ATLAS_KEY, FACE_ATLAS_PATH, FACE_SHEET_PATH);
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
    this.showFaceBaseImage();
    this.showSampleMesh2();
    this.showSampleImage();
    // テキストラベル
    this.textLabel = new TextLabel(this, LABEL_TEXT_COLOR, 1, LABEL_TEXT_SIZE);
    this.textLabel.setPosition(canvas.width/2, canvas.height * 0.95);
    this.textLabel.setDepth(DefineDepth.UI);
    this.textLabel.setTextAsync(TITLE).then();

    // FPS表示
    new FpsView(this);
    
    // 画面のどこかをタッチした時の処理
    this.input.on('pointerdown', () => {
      this.isShow = true;
    });
  }

  public dispose() {
    this.disposables.forEach(d => d.dispose());
  }

  /**
   * フレーム更新
   */
  update() {
    if (!this.isShow) return;
    
    //this.updateSampleMesh1();
    this.updateSampleMesh2(this.game.loop.delta);
  }
  
  /*
  private updateSampleMesh1() {
    if (!this.hairMesh) return;

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
  }
  */

  private updateSampleMesh2(delta: number) {
    const dt = delta / 1000;
    this.timeSec += dt;

    // デモ用：キャラを左右に自動移動
    //const speed = this.character.getData('speed') as number;
    this.character.x = this.game.canvas.width/2 + Math.sin(this.timeSec * 0.8) * 120;

    // 速度から揺れ強度を計算
    const vx = (this.character.x - this.prevCharX) / dt;
    this.prevCharX = this.character.x;

    // 絶対速度からざっくり強度に変換
    const swayStrength = Phaser.Math.Clamp(Math.abs(vx) * 0.02, 0, 20);

    // 髪メッシュの頂点を変形
    this.updateHairVertices(this.timeSec, swayStrength);
  }

  /**
   * 髪メッシュの頂点をスクリプトのみで揺らす処理
   */
  private updateHairVertices(timeSec: number, swayStrength: number) {
    const verts = this.vertices;
    const base = this.baseVerts;
    const weights = this.rootToTip;

    // シンプルに sinusoidal な揺れ
    // x方向オフセット = sin(時間 + 高さ依存) * 強度 * rootToTip
    for (let i = 0; i < verts.length; i++) {
      const v = verts[i];
      const b = base[i];
      const w = weights[i];

      // まず原型に戻す
      v.x = b.x;
      v.y = b.y;

      // 先端ほどよく揺れるように
      const sway =
        Math.sin(timeSec * 4.0 + b.y * 0.15) *
        swayStrength *
        w;

      v.x += sway;
    }

    // ignoreDirtyCache = true にしてあるので、
    // 頂点更新後に特別なフラグ更新は不要（毎フレーム再計算される想定） [oai_citation:9‡rexrainbow.github.io](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/mesh/)
  }

  // Removed prepareFaceTextureFrames: manual frame registration is unnecessary when using load.atlas.

  /** ChatGPT: face_baseフレームを画面中央に表示する */
  private showFaceBaseImage() {
    // No need to manually register frames; load.atlas handles this.
    const {centerX, centerY} = this.cameras.main;
    this.faceImage = this.add.image(centerX, centerY, FACE_ATLAS_KEY, 'face_base');
    this.faceImage.setDepth(DefineDepth.UI - 2);
    this.faceImage.setOrigin(0.5, 0.5);
  }

  /**
   * Mesh.GenerateGridVertsを使うパターン
   */
  private showSampleMesh2() {
    const {centerX, centerY} = this.cameras.main;
    const mesh = this.add.mesh(centerX, centerY, SAMPLE_IMAGE_KEY);

    // 頂点をピクセルベースで作る
    Phaser.Geom.Mesh.GenerateGridVerts({
      mesh,
      texture: SAMPLE_IMAGE_KEY,
      widthSegments: this.meshColumns,
      heightSegments: this.meshRows,
      isOrtho: true
    });

    // setOrtho
    mesh.hideCCW = false;
    const aspectRatioScreen = this.game.canvas.width / this.game.canvas.height;
    mesh.setOrtho(aspectRatioScreen, 1);
    mesh.setDepth(DefineDepth.UI - 1);
    mesh.setDisplaySize(this.sampleImageSize.width, this.sampleImageSize.height);
    this.hairMesh = mesh;

    // 頂点配列取得
    this.vertices = this.hairMesh.vertices;
    // 初期位置を保存（原型保持用）
    this.baseVerts = this.vertices.map(v => ({ x: v.x, y: v.y }));
    // rootToTip（先端ほど1.0になる重み）を準備
    this.rootToTip = this.computeRootToTipWeights();

    // 頂点更新を毎フレームやるので DirtyCache は無視させる [oai_citation:8‡rexrainbow.github.io](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/mesh/)
    this.hairMesh.ignoreDirtyCache = true;
    
    // デモ用キャラコンテナにぶら下げる
    this.character = this.add.container(this.sampleImagePosition.x, this.sampleImagePosition.y);
    this.hairMesh.setPosition(0,0);
    this.character.add(this.hairMesh);
  }

  /**
   * 頂点の y の位置から「根本〜先端」の重みを計算する
   * 今回は単純に y の最小/最大で正規化して 0〜1 にしている
   */
  private computeRootToTipWeights(): number[] {
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const v of this.vertices) {
      if (v.y < minY) minY = v.y;
      if (v.y > maxY) maxY = v.y;
    }

    const range = Math.max(maxY - minY, 0.0001);
    return this.vertices.map(v => {
      return (v.y - minY) / range; // 下＝0, 上＝1 の想定
    });
  }
  

  /**
   * ChatGPT: サンプル画像に髪の毛風のメッシュを適用する
   * 自前で頂点追加するとピクセルサイズとずれるのて失敗パターン。
   * Mesh.GenerateGridVertsを使うこと
   */
  /*
  private showSampleMesh1() {
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
    this.hairMesh.hideCCW = false;
    const aspectRatioScreen = this.game.canvas.width / this.game.canvas.height;
    this.hairMesh.setOrtho(meshWidth*aspectRatioScreen, meshHeight);
    this.hairMesh.addVertices(vertices, uvs, indices);
    // GPT-5.1-Codex-Max: 頂点ごとの揺らぎを毎フレーム反映させるためダーティキャッシュを無効化
    this.hairMesh.ignoreDirtyCache = true;
    this.hairMesh.setDepth(DefineDepth.UI - 1);
    this.hairMesh.setScale(1);
    this.hairMesh.setAlpha(0.5);
    // GPT-5.1-Codex-Max: 論理頂点の基準座標と対応インデックスを保持する
    this.meshBaseVertices = logicalVertices;
    this.meshVertexLogicalIndices = this.buildVertexLogicalIndexMap(indices, logicalVertices.length);
  }
  */
  
  /** GPT-5.1-Codex-Max: 右下にサンプルイメージを配置する */
  private showSampleImage() {
    const sampleImage = this.add.image(this.sampleImagePosition.x, this.sampleImagePosition.y, SAMPLE_IMAGE_KEY);
    sampleImage.setDisplaySize(this.sampleImageSize.width, this.sampleImageSize.height);
    sampleImage.setAlpha(0.5);
    const color = 0x8888ff;
    sampleImage.setTintFill(color);
    sampleImage.setDepth(DefineDepth.UI - 1);
  }

  /** GPT-5.1-Codex-Max: 実頂点から論理頂点への対応表を生成する */
  /*
  private buildVertexLogicalIndexMap(indices: number[], logicalVertexCount: number): number[] {
    // GPT-5.1-Codex-Max: インデックス付き追加時はMesh.verticesと同順になるのでコピーする
    if (indices.length > 0) return [...indices];
    // GPT-5.1-Codex-Max: インデックス未使用の場合は順序通りにマッピングする
    return Array.from({length: logicalVertexCount}, (_, i) => i);
  }
  */
}
new Phaser.Game(createConfig([SummaryScene]));
