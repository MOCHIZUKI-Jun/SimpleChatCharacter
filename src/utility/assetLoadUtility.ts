import {AssetLoader, AssetLoaderSceneModel} from "./assetLoader.ts";
import {waitUntil} from "./asyncUtility.ts";
import {Scene} from "phaser";
import {getShaderPath} from "./assetResourcePathUtility.ts";
import {isLocalhost} from "./localhostUtility.ts";
import {getAssetResourceKey} from "./assetResourceKeyUtility.ts";

/**
 * ひとつのシェーダーのロード
 */
export const loadSingleShaderTextAsync = async (baseScene: Scene, folderName: string, category: number, index: number, ext = ".frag") => {
  const filePath = getShaderPath(folderName, category, index, ext);
  return  await loadSingleAssetAsync(baseScene, filePath);
}

/**
 * 指定ファイルパスについてロード
 */
export const loadSingleAssetAsync = async (baseScene: Scene, filePath: string) => {
  const shaderPaths:string[] = [];
  const texturePaths:string[] = [];
  const jsonPaths:string[] = [];
  
  
  if (filePath.endsWith(".frag") || filePath.endsWith(".vert")) {
    shaderPaths.push(filePath);
  }
  if (filePath.endsWith(".png") || filePath.endsWith(".webp")) {
    texturePaths.push(filePath);
  }
  if (filePath.endsWith(".json")) {
    jsonPaths.push(filePath);
  }
  
  return  await loadAssetsAsync(baseScene, shaderPaths, texturePaths, jsonPaths);
}

/**
 * 指定ファイルパス配列についてロード
 */
export const loadAssetsAsync = async (
  baseScene: Scene,
  shaderPaths: string[],
  texturePaths: string[],
  jsonPaths: string[]
) => {
  const assetLoaderSceneModel = new AssetLoaderSceneModel(
    shaderPaths,
    texturePaths,
    jsonPaths
  );
  const sceneData = { sceneModel: assetLoaderSceneModel };
  baseScene.scene.launch(AssetLoader.Key, sceneData);
  await waitUntil(() => assetLoaderSceneModel.done);
  // NOTE: removeだと完全に削除されて次のlaunchが効かなくなる
  baseScene.scene.stop(AssetLoader.Key);
  console.log("AssetLoader stop");

  // NOTE: localhostの場合にテキストロードの失敗が検知されないので即座に内容を確認して失敗していたらエラーにする
  if (isLocalhost() && shaderPaths.length > 0) {
    for (const filePath of shaderPaths) {
      const key = getAssetResourceKey(filePath);
      const text = baseScene.cache.text.get(key);
      // localhostではテキストアセットリソースのロードは失敗せずhtmlの記述が帰るのでそれをチェック
      if (text.startsWith("<")) {
        console.log("text load error", filePath);
        assetLoaderSceneModel.failCount++;
      }
    }
  }
  
  return assetLoaderSceneModel;
}