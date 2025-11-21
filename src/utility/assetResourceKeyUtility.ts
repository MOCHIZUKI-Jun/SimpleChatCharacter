
/**
 * パスの末尾のファイル名をそのままkeyとして返す
 */
export const getAssetResourceKey = (filePath: string) => {
  const splits = filePath.split('/');
  const fileName = splits[splits.length - 1];
  return fileName;
}

/**
 * カテゴリーとインデックスを指定してシェーダーアセットのキーを取得
 */
export const getShaderKey = (category: number, index: number, ext = ".frag") => {
  const categoryStr = category.toString().padStart(2, "0");
  const indexStr = index.toString().padStart(2, "0");
  return `shader_${categoryStr}-${indexStr}${ext}`;
}