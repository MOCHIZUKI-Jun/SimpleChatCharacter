import Phaser, { Scene } from "phaser";
import {getAssetResourceKey} from "./assetResourceKeyUtility.ts";

/**
 * Phaserのシーン間データ受け渡しの型
 */
export type AssetLoaderSceneData = {
  sceneModel: AssetLoaderSceneModel;
};

/**
 * アセットローダシーンモデル
 */
export class AssetLoaderSceneModel {
  // 完了か
  public done = false;
  // 失敗数
  public failCount = 0;
  
  // シェーダーテキスト
  public readonly shaderTextPaths: string[] = [];
  // テクスチャ
  public readonly texturePaths: string[] = [];
  // json
  public readonly jsonPaths: string[] = [];
  
  /**
   * コンストラクタ
   */
  constructor(shaderTextPaths: string[], texturePaths:string[], jsonPaths: string[]) {
    this.shaderTextPaths = shaderTextPaths;
    this.texturePaths = texturePaths;
    this.jsonPaths = jsonPaths;
  }
}

/**
 * キャッシュ
 */
const loadCache: Map<
  string /*fileName*/,
  string /*key*/
> = new Map();

/**
 * アセットローダー
 * PhaserはアセットリソースのロードはSceneのpreloadで行うためSceneを継承。
 */
export class AssetLoader extends Scene {
  // シーンキー
  public static Key = "assetLoaderScene";
  
  // シーンモデル
  private sceneModel!: AssetLoaderSceneModel;

  /**
   * コンストラクタ
   * (Phaserのゲームインスタンス生成タイミングでの実行)
   */
  constructor() {
    super(AssetLoader.Key);
    console.log("AssetLoader constructor");
  }

  /**
   * 初期化処理
   */
  init(data: AssetLoaderSceneData) {
    console.log("AssetLoader init");
    this.sceneModel = data.sceneModel;
  }

  /**
   * アセットリソース読み込み
   */
  preload() {
    console.log("AssetLoader preload");
    
    this.load.on("complete", (info: Phaser.Loader.LoaderPlugin) => {
      console.log("load complete totalComplete", info.totalComplete);
      console.log("load complete totalFailed", info.totalFailed);
      this.sceneModel.done = true;
      this.sceneModel.failCount = info.totalFailed;
    });
    
    // シェーダーテキストロード
    for (const path of this.sceneModel.shaderTextPaths) {
      if (loadCache.has(path)) continue;
      const key = getAssetResourceKey(path);
      this.load.text(key, path);
      loadCache.set(path, key);
      console.log("shader text loaded:", key, path);
    }

    // テクスチャロード
    for (const path of this.sceneModel.texturePaths) {
      if (loadCache.has(path)) continue;
      const key = getAssetResourceKey(path);
      this.load.image(key, path);
      loadCache.set(path, key);
      console.log("texture loaded:", key, path);
    }

      // jsonロード
    for (const path of this.sceneModel.jsonPaths) {
      if (loadCache.has(path)) continue;
      const key = getAssetResourceKey(path);
      this.load.json(key, path);
      loadCache.set(path, key);
      console.log("json loaded:", key, path);
    }
  }

  /**
   * ゲームオブジェクト初期化
   */
  create() {
    console.log("AssetLoader create");
  }
}