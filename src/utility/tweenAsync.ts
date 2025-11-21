import Phaser, {Scene} from "phaser";

/**
 *  糖衣構文 Phaser Tween
 */
export const tweenAsync = (scene: Scene, config: Phaser.Types.Tweens.TweenBuilderConfig) => {
  return new Promise<void>((resolve) => {
    scene.tweens.add({
      ...config,
      onComplete: () => {
        resolve();
      }
    });
  });
}