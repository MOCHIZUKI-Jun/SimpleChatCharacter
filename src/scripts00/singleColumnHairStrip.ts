import Phaser from "phaser";
import {getWorldPos} from "../utility/transformUtility.ts";

/**
 * 頂点制御単位
 */
class VertsControlUnit {
  unitPos!: Phaser.Math.Vector2;
  leftVerts!: Phaser.Geom.Mesh.Vertex[];
  rightVerts!: Phaser.Geom.Mesh.Vertex[];

  initUnitPos!: Phaser.Math.Vector2;
  initDiffLeft!: Phaser.Math.Vector2;
  initDiffRight!: Phaser.Math.Vector2;
}

/**
 * 設定
 */
export class HairStripConfig  {
  moveDiffCoef: number;
  lerpCoef: number;
  moveBeginIndex: number;
  
  constructor(
    moveDiffCoef: number = 0.02,
    lerpCoef: number = 0.2,
    moveBeginIndex: number = 0
  ) {
    this.moveDiffCoef = moveDiffCoef;
    this.lerpCoef = lerpCoef;
    this.moveBeginIndex = moveBeginIndex;
  }
}

/**
 * 1列n行の髪の毛用のメッシュ制御
 */
export class SingleColumnHairStrip extends Phaser.GameObjects.Container {
  private debug?: Phaser.GameObjects.Graphics;
  private mesh: Phaser.GameObjects.Mesh;

  // 設定
  private config:HairStripConfig = new HairStripConfig();
  
  private isEnable = false;
  private prevWorldPos = new Phaser.Math.Vector2();

  // 頂点グループ(頂点インデックス順)
  private vertexGroups: Phaser.Geom.Mesh.Vertex[][];
  // 制御単位
  private vertsControlUnits: VertsControlUnit[] = [];

  private acc = 0;
  private readonly fixedDt = 1000 / 60; // 60fps = 16.666... ms
  
  constructor(
    scene: Phaser.Scene,
    textureKey: string,
    rows: number,
    width: number,
    height: number,
    config?: HairStripConfig,
    atlasKey?: string,
    isDebug = false
  ) {
    super(scene, 0, 0);
    this.mesh = scene.add.mesh(0, 0, textureKey, atlasKey);
    this.add(this.mesh);

    // 設定
    if (config) this.config = config;
    
    const cols = 1;
    
    // 頂点をピクセルベースで作る
    Phaser.Geom.Mesh.GenerateGridVerts({
      mesh: this.mesh,
      texture: textureKey,
      frame: atlasKey,
      widthSegments: cols,
      heightSegments: rows,
      isOrtho: true
    });

    // setOrtho
    this.mesh.hideCCW = false;
    const aspectRatioScreen = scene.game.canvas.width / scene.game.canvas.height;
    this.mesh.setOrtho(aspectRatioScreen, 1);
    this.mesh.setDisplaySize(width, height);

    // 頂点更新を毎フレームやるので DirtyCache は無視させる
    this.mesh.ignoreDirtyCache = true;

    if (isDebug) {
      this.debug = scene.add.graphics();
      this.debug.setDepth(9999);
      this.mesh.setDebug(this.debug);
    }
    
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
    this.vertexGroups.sort((a, b) => {
      const va = a[0];
      const vb = b[0];
      if (va.v < vb.v) return -1;
      if (va.v > vb.v) return 1;
      if (va.u < vb.u) return -1;
      if (va.u > vb.u) return 1;
      return 0;
    });

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

      const unit = new VertsControlUnit();
      unit.unitPos = unitPos;
      unit.leftVerts = leftGroup;
      unit.rightVerts = rightGroup;
      unit.initUnitPos = initUnitPos;
      unit.initDiffLeft = initDiffLeft;
      unit.initDiffRight = initDiffRight;
      
      this.vertsControlUnits.push(unit);
    }

    this.scene.events.on("update", () => {
      const delta = this.scene.game.loop.delta;
      this.acc += delta;
      // 16.6ms貯まるまでは何もしない（フレームスキップ）
      if (this.acc < this.fixedDt) {
        return;
      }
      // たまにdeltaがデカいとき用に while で追いつく
      while (this.acc >= this.fixedDt) {
        this.acc -= this.fixedDt;
        this.fixedUpdate(this.fixedDt);
      }
    });
  }

  /**
   * 有効設定
   */
  public setEnable(isEnable: boolean) {
    const worldPosition = getWorldPos(this);
    this.prevWorldPos.x = worldPosition.x;
    this.prevWorldPos.y = worldPosition.y;
    this.isEnable = isEnable;
  }
  
  /**
   * 毎フレーム呼ぶ
   */
  private currDiffX = 0;
  onUpdate(deltaTime: number) {
    if (!this.isEnable) return;
    
    const worldPosition = getWorldPos(this);
    const beginIndex = this.config.moveBeginIndex;
    const moveDiffCoef = this.config.moveDiffCoef;
    const lerpCoef = this.config.lerpCoef;

    const diffX = worldPosition.x - this.prevWorldPos.x;
    this.currDiffX = Phaser.Math.Linear(this.currDiffX, diffX, 0.2);
    const deltaTimeFactor = deltaTime / (1000 / 60);
    
    for (let i = beginIndex; i < this.vertsControlUnits.length; i++) {
      const movePosX = -this.currDiffX  * ((i - beginIndex) / this.vertsControlUnits.length) * moveDiffCoef;

      const unit = this.vertsControlUnits[i];
      const targetX = unit.unitPos.x + (movePosX * deltaTimeFactor);
      
      // 左右の頂点を移動
      for (const v of unit.leftVerts) {
        v.x = Phaser.Math.Linear(v.x, unit.initUnitPos.x + unit.initDiffLeft.x + targetX, lerpCoef * deltaTimeFactor);
      }
      for (const v of unit.rightVerts) {
        v.x = Phaser.Math.Linear(v.x, unit.initUnitPos.x + unit.initDiffRight.x + targetX, lerpCoef * deltaTimeFactor);
      }
    }

    this.prevWorldPos.x = worldPosition.x;
    this.prevWorldPos.y = worldPosition.y;
    
    this.debug?.clear();
    this.debug?.lineStyle(1, 0x00ff00);
  }
  
  private fixedUpdate(deltaTime: number) {
    this.onUpdate(deltaTime);
  }
}