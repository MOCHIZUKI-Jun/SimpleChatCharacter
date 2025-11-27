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

/**
 * 指定コンテナは親階層を含めて可視か
 */
export const isVisibleWithParent = (target: Phaser.GameObjects.Container) => {
  let current = target;
  // 親階層の visible をすべて遡って確認
  while (current) {
    if (!current.visible) {
      return false;
    }
    current = current.parentContainer;
  }
  return true;
};