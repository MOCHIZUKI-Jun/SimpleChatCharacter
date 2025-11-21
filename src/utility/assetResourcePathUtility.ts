
/**
 * シェーダーファイルパスを取得
 * ../shaders/folderName/shader_00-00.frag
 */
export const getShaderPath = (folderName: string, category: number, index: number, ext = ".frag") => {
  const categoryStr = category.toString().padStart(2, "0");
  const indexStr = index.toString().padStart(2, "0");
  const fileName = `shader_${categoryStr}-${indexStr}${ext}`;
  return `../shaders/${folderName}/${fileName}`;
}