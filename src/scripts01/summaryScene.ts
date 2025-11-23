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
  private character!: Phaser.GameObjects.Container;
  private prevCharX = 0;
  private timeSec = 0;

  private faceImage?: Phaser.GameObjects.Image;

  private meshBaseVertices: Phaser.Math.Vector3[] = [];
  private meshTopY = 0;
  private meshHeight = 1;
  

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

    // 速度から角度を計算（-30〜30度をラジアン化）
    const vx = (this.character.x - this.prevCharX) / dt;
    this.prevCharX = this.character.x;

    const angleDeg = Phaser.Math.Clamp(vx * 0.35, -30, 30);
    const angleRad = Phaser.Math.DegToRad(angleDeg);

    // 髪メッシュの頂点を変形
    this.updateHairVertices(angleRad);
  }

  /** GPT-5.1-Codex-Max: 髪メッシュの頂点を角度ベースで揺らす処理 */
  private updateHairVertices(baseAngleRad: number) {
    if (!this.hairMesh) return;
    if (!this.meshBaseVertices.length) return;

    const waveOffset = Phaser.Math.DegToRad(Math.sin(this.timeSec * 3.0) * 5);
    const maxAngleRad = Phaser.Math.DegToRad(30);
    const finalAngle = Phaser.Math.Clamp(baseAngleRad + waveOffset, -maxAngleRad, maxAngleRad);

    this.updateHairMeshFromAngle(
      this.hairMesh,
      finalAngle
    );
  }

  /** GPT-5.1-Codex-Max: 角度に応じて保持しておいた基準頂点を回転させる */
  private updateHairMeshFromAngle(
    mesh: Phaser.GameObjects.Mesh,
    angleRad: number
  ) {
    const pivotX = 0;
    const pivotY = this.meshTopY;

    mesh.vertices.forEach((vertex, index) => {
      const base = this.meshBaseVertices[index];
      if (!base) return;

      const heightRate = Phaser.Math.Clamp((base.y - this.meshTopY) / this.meshHeight, 0, 1);
      const appliedAngle = angleRad * heightRate;
      const rotated = Phaser.Math.RotateAround(
        new Phaser.Math.Vector2(base.x, base.y),
        pivotX,
        pivotY,
        appliedAngle
      );

      vertex.x = rotated.x;
      vertex.y = rotated.y;
    });
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
    this.captureHairMeshBase(mesh);
    this.hairMesh = mesh;

    // 頂点更新を毎フレームやるので DirtyCache は無視させる [oai_citation:8‡rexrainbow.github.io](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/mesh/)
    this.hairMesh.ignoreDirtyCache = true;

    // デモ用キャラコンテナにぶら下げる
    this.character = this.add.container(this.sampleImagePosition.x, this.sampleImagePosition.y);
    this.hairMesh.setPosition(0,0);
    this.character.add(this.hairMesh);
    this.prevCharX = this.character.x;
  }

  /** GPT-5.1-Codex-Max: メッシュ生成直後の頂点情報を保持する */
  private captureHairMeshBase(mesh: Phaser.GameObjects.Mesh) {
    this.meshBaseVertices = mesh.vertices.map(vertex => vertex.clone());

    const ys = this.meshBaseVertices.map(v => v.y);
    this.meshTopY = Math.min(...ys);
    const bottomY = Math.max(...ys);
    this.meshHeight = Math.max(bottomY - this.meshTopY, 1);
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
