import {GetColorCodeByRGB, GetColorCodeTextByRGB} from "../utility/colorUtility.ts";


// タイトル
export const TITLE = "こんにちわ☆";

// カテゴリー番号
export const CATEGORY = 0;

// シェーダーフォルダ名
export const SHADER_FOLDER = 'shaders00';

// jsonファイルパス
export const PATH_JSONS = {
  SHEET_00_01: `../jsons/jsons00/sheet00-01.json`
}

/**
 * 表示オーダー
 */
export const DefineDepth = {
  BACKGROUND: -1,
  UI: 100,
}

// 背景色
export const BACKGROUND_COLOR = GetColorCodeByRGB(255, 255, 255);
// ラベルテキスト色
export const LABEL_TEXT_COLOR = GetColorCodeTextByRGB(60, 60, 60);
// ラベルテキストサイズ
export const LABEL_TEXT_SIZE = 30;