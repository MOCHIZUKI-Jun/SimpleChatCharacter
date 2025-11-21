import {GetColorCodeByRGB, GetColorCodeTextByRGB} from "../utility/colorUtility.ts";

// タイトル
export const TITLE = "さようなら";

// カテゴリー番号
export const CATEGORY = 1;

// シェーダーフォルダ名
export const SHADER_FOLDER = 'shaders01eye';

/**
 * 表示オーダー
 */
export const DefineDepth = {
  BACKGROUND: -1,
  UI: 100,
}

// 背景色
export const BACKGROUND_COLOR = GetColorCodeByRGB(0, 0, 0);
// 戻るボタン色
export const BACK_BUTTON_COLOR = GetColorCodeByRGB(78, 78, 78);
// 戻るボタン透明度
export const BACK_BUTTON_ALPHA = 0.5;
// ラベルテキスト色
export const LABEL_TEXT_COLOR = GetColorCodeTextByRGB(180, 180, 180);
// ラベルテキストサイズ
export const LABEL_TEXT_SIZE = 30;