import {getAssetResourceKey} from "./assetResourceKeyUtility.ts";

export const preloadJson = (scene:Phaser.Scene, filePath:string) => {
  const key = getAssetResourceKey(filePath);
  scene.load.json(key, filePath);
}