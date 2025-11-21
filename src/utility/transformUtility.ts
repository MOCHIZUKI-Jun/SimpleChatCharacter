import * as Phaser from "phaser";

/**
 * ワールド座標を指定してローカル座標を取得する
 */
export const getLocalPos = 
  (worldX: number, worldY: number, parentContainer: Phaser.GameObjects.Container) => {
  const parentMatrix = parentContainer.getWorldTransformMatrix();
  const inverseMatrix = parentMatrix.invert();
  const local = inverseMatrix.transformPoint(worldX, worldY);
  return { x: local.x, y: local.y };
};

/**
 * 指定コンテナのワールド座標を取得する
 */
export const getWorldPos = (target: Phaser.GameObjects.Container) => {
  const worldMatrix = target.getWorldTransformMatrix();
  return { x: worldMatrix.tx, y: worldMatrix.ty };
};
