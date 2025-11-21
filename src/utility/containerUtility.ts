import Phaser from "phaser";

/**
 * 親コンテナを配列で取得
 */
export const getParents = (self: Phaser.GameObjects.Container) => {
  const parents: Phaser.GameObjects.Container[] = [];
  let parent = self.parentContainer;
  while (parent) {
    parents.push(parent);
    parent = parent.parentContainer;
  }
  return parents;
}