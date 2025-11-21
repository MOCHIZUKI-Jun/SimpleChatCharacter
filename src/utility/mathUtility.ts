import Phaser from "phaser";

/**
 * smoothStep補完(vについてa以下は0, b以上は1を返すようになめらかに補完)
 */
export const smoothstep = (a: number, b: number, v: number) => {
  const ret = Phaser.Math.Clamp((v - a) / (b - a), 0, 1);
  return ret * ret * (3 - 2 * ret);
}

/**
 * 逆補完(0~1)を取得
 */
export const inverseLerp = (a: number, b: number, value: number) => {
  if (a === b) return 0;
  if (value <= a) return 0;
  if (value >= b) return 1;
  return (value - a) / (b - a);
};