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
import {getWorldPos} from "../utility/transformUtility.ts";

const SAMPLE_IMAGE_KEY = 'sample-image';
const FACE_ATLAS_KEY = 'image-face03';

/*
const createUniqueSortedVertices = (vertices: Vertex[]) => {
  const seen = {};
  // we need to remove verticies with the same coordinates to make sure we map the bodies in the cloth correctly (and don't pick the "same" vertex)
  const tmp = [...vertices].filter((item)=> {
    if(seen.hasOwnProperty(item.u + '-' + item.v)) return false;
    seen[item.u + '-' + item.v] = true;
    return true;
  });

  // sort based on UV map. UV coordinate 0,0 first, and 1,1 last
  tmp.sort((a, b) => {
    if (a.v < b.v) return -1;
    if (a.v > b.v) return 1;
    if (a.u < b.u) return -1;
    if (a.u > b.u) return 1;
    return 0;
  });
  return tmp;
}
*/

/**
 * 頂点を簡単に移動させるためにまとめた単位
 */
type LogicalVertsUnit = {
  unitPos: Phaser.Math.Vector2;
  leftVerts: Phaser.Geom.Mesh.Vertex[];
  rightVerts: Phaser.Geom.Mesh.Vertex[];
  
  initUnitPos: Phaser.Math.Vector2;
  initDiffLeft: Phaser.Math.Vector2;
  initDiffRight: Phaser.Math.Vector2;
}

export class HairStrip extends Phaser.GameObjects.Container {
  
  debug: Phaser.GameObjects.Graphics;
  mesh: Phaser.GameObjects.Mesh;
  
  
  // 頂点グループ(頂点インデックス順)
  private vertexGroups: Phaser.Geom.Mesh.Vertex[][];
  // ユニット
  private logicalVertsUnits: LogicalVertsUnit[] = [];

  constructor(
    scene: Phaser.Scene,
    textureKey: string,
    rows: number, // 行数
    cols: number, // 列数
    width: number,  // 髪テクスチャの幅
    height: number, // 髪テクスチャの高さ
  ) {
    super(scene, 0, 0);
    this.mesh = scene.add.mesh(0, 0, textureKey);
    this.add(this.mesh);

    // 頂点をピクセルベースで作る
    const result = Phaser.Geom.Mesh.GenerateGridVerts({
      mesh: this.mesh,
      texture: textureKey,
      widthSegments: cols,
      heightSegments: rows,
      isOrtho: true
    });
    
    console.log(result);

    // setOrtho
    this.mesh.hideCCW = false;
    const aspectRatioScreen = scene.game.canvas.width / scene.game.canvas.height;
    this.mesh.setOrtho(aspectRatioScreen, 1);
    this.mesh.setDepth(DefineDepth.UI - 1);
    this.mesh.setDisplaySize(width, height);

    // 頂点更新を毎フレームやるので DirtyCache は無視させる [oai_citation:8‡rexrainbow.github.io](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/mesh/)
    this.mesh.ignoreDirtyCache = true;

    this.debug = scene.add.graphics(); // create graphics that we can use for bugging
    this.debug.setDepth(9999);
    this.mesh.setDebug(this.debug);
    
    const vertsMapByPosition: {[key: string]: Phaser.Geom.Mesh.Vertex[]} = {};
    
    // 頂点グループを整理
    for (const v of this.mesh.vertices) {
      const key = `${v.x.toFixed(4)}_${v.y.toFixed(4)}`;
      if (!vertsMapByPosition[key]) {
        vertsMapByPosition[key] = [];
      }
      vertsMapByPosition[key].push(v);
    }
    
    this.vertexGroups = Object.values(vertsMapByPosition);
    
    // uv順にソート
    // sort based on UV map. UV coordinate 0,0 first, and 1,1 last
    this.vertexGroups.sort((a, b) => {
      const va = a[0];
      const vb = b[0];
      if (va.v < vb.v) return -1;
      if (va.v > vb.v) return 1;
      if (va.u < vb.u) return -1;
      if (va.u > vb.u) return 1;
      return 0;
    });
    
    for (const vertGroup of this.vertexGroups) {
      console.log('-------vertGroup', vertGroup);
      for (const v of vertGroup) {
        // 小数点4桁まで表示
        const xStr = v.x.toFixed(4);
        const yStr = v.y.toFixed(4);
        console.log(`  vert x:${xStr} y:${yStr} u:${v.u.toFixed(4)} v:${v.v.toFixed(4)}`);
      }
    }
    
    for (let row = 0; row <= rows; row++) {
      const leftIndex = row * (cols + 1);
      const rightIndex = leftIndex + 1;
      
      const leftGroup = this.vertexGroups[leftIndex];
      const rightGroup = this.vertexGroups[rightIndex];
      
      const unitPos = new Phaser.Math.Vector2(
        (leftGroup[0].x + rightGroup[0].x) / 2,
        leftGroup[0].y
      );
      
      const initUnitPos = new Phaser.Math.Vector2();
      initUnitPos.x = unitPos.x;
      initUnitPos.y = unitPos.y;
      
      const initDiffLeft = new Phaser.Math.Vector2();
      initDiffLeft.x = leftGroup[0].x - unitPos.x;
      initDiffLeft.y = leftGroup[0].y - unitPos.y;
      
      const initDiffRight = new Phaser.Math.Vector2();
      initDiffRight.x = rightGroup[0].x - unitPos.x;
      initDiffRight.y = rightGroup[0].y - unitPos.y;
      
      const unit: LogicalVertsUnit = {
        unitPos,
        leftVerts: leftGroup,
        rightVerts: rightGroup,
        initUnitPos,
        initDiffLeft,
        initDiffRight,
      }
      
      this.logicalVertsUnits.push(unit);
      
      // 行番号とunitをログに出す
      console.log(`unit row:${row} unit:`, unit);
    }
  }

  /**
   * 毎フレーム呼ぶ
   */
  private prevWorldPos = new Phaser.Math.Vector2();
  updateSampleMesh2() {
    
    const worldPosition = getWorldPos(this);
    //console.log('worldPosition', worldPosition);
    
    
    for (let i = 0; i < this.logicalVertsUnits.length; i++) {
      const diffX = worldPosition.x - this.prevWorldPos.x;
      const movePosX = diffX /* * (i / this.logicalVertsUnits.length) * 2 */; // 徐々に大きく動かす
      
      const unit = this.logicalVertsUnits[i];
      //const targetX = unit.unitPos.x + movePosX * 0.1;
      
      const targetX = worldPosition.x * 0.0002 * (i); // 徐々に大きく動かす
      
      // 左右の頂点を移動
      for (const v of unit.leftVerts) {
        v.x = unit.initUnitPos.x + unit.initDiffLeft.x + targetX;
      }
      for (const v of unit.rightVerts) {
        v.x = unit.initUnitPos.x + unit.initDiffRight.x + targetX;
      }
    }
    
    this.prevWorldPos.x = worldPosition.x;
    this.prevWorldPos.y = worldPosition.y;


    this.debug.clear();
    this.debug.lineStyle(1, 0x00ff00);
    
    //this.mesh.
  }
}

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
  
  // サンプルメッシュ
  private hairStrip?: HairStrip;
  private readonly sampleMeshRows = 5;
  private readonly sampleMeshColumns = 1;
  
  // サンプルフェイスイメージ
  private faceImage?: Phaser.GameObjects.Image;
  
  private hairContainer?: Phaser.GameObjects.Container;
  
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
    this.showSampleImage();
    this.showSampleMesh2();
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
    this.hairStrip?.updateSampleMesh2();

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
  
  private showSampleMesh2() {
    const canvas = this.game.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    this.hairContainer = this.add.container(centerX, centerY);
    this.hairContainer.setDepth(DefineDepth.UI + 1);
    const rect = this.add.rectangle(0, 0, this.sampleImageSize.width, this.sampleImageSize.height, 0xff0000, 0.2);
    this.hairContainer.add(rect);
    
    this.hairStrip = new HairStrip(
      this,
      SAMPLE_IMAGE_KEY,
      this.sampleMeshRows,
      this.sampleMeshColumns,
      this.sampleImageSize.width,
      this.sampleImageSize.height,
    );
    
    this.hairContainer.add(this.hairStrip);
    
    // hairContainerを左右に移動(ループ)
    this.tweens.add({
      targets: this.hairContainer,
      x: centerX + 100,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
  
  /** ChatGPT: face_baseフレームを画面中央に表示する */
  private showFaceBaseImage() {
    // No need to manually register frames; load.atlas handles this.
    const {centerX, centerY} = this.cameras.main;
    this.faceImage = this.add.image(centerX, centerY, FACE_ATLAS_KEY, 'face_base');
    this.faceImage.setDepth(DefineDepth.UI - 2);
    this.faceImage.setOrigin(0.5, 0.5);
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
