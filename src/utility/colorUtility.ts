
/**
 * RGBからカラーコードを取得する
 */
export const GetColorCodeByRGB = (r: number, g: number, b: number): number =>
  (r << 16) + (g << 8) + b;

/**
 * RGBからカラーコードのテキストを取得する
 */
export const GetColorCodeTextByRGB = (r: number, g: number, b: number) => {
  const toHex = (n: number): string => {
    const hex = n.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};