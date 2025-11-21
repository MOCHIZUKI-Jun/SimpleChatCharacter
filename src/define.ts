import Phaser from "phaser";

/**
 * スクリーンサイズ(基準)
 */
export const SCREEN_SIZE = {
  WIDTH: 1080,
  HEIGHT: 1080
};

/**
 * モバイル用スクリーンサイズ
 */
export const MOBILE_SCREEN_SIZE = {
  WIDTH: 720,
  HEIGHT: 1080
}

const isMobile = /iPhone|Android/i.test(navigator.userAgent);

/**
 * 基準スクリーンサイズとモバイルのスクリーンサイズでオブジェクトの見た目を統一する際のスケール補正値を取得
 */
export const fixScaleByWidth = (canvas: HTMLCanvasElement) => {
  const canvasWidth = canvas.width;
  return canvasWidth / SCREEN_SIZE.WIDTH;
}

/**
 * フォントファミリー
 */
export const FONT_SMARTFONTUI = "smartfontui";

/**
 * Phaserコンフィグ作成
 */
export const createConfig = (scenes: Phaser.Types.Scenes.SceneType[]) => {
  return {
    type: Phaser.AUTO,
    parent: 'game-root',
    scale: {
      mode: isMobile ? Phaser.Scale.FIT : Phaser.Scale.FIT,
      autoCenter: isMobile ? Phaser.Scale.CENTER_BOTH : Phaser.Scale.CENTER_BOTH,
      width: isMobile ? MOBILE_SCREEN_SIZE.WIDTH : SCREEN_SIZE.WIDTH,
      height: isMobile ? MOBILE_SCREEN_SIZE.HEIGHT : SCREEN_SIZE.HEIGHT,
    },
    scene: scenes,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x:0, y: 0 }
      }
    }
  }
}