import {GetColorCodeByRGB, GetColorCodeTextByRGB} from "../utility/colorUtility.ts";


// タイトル
export const TITLE = "こんにちわ☆";

// カテゴリー番号
export const CATEGORY = 0;

// シェーダーフォルダ名
export const SHADER_FOLDER = 'shaders00';

// 顔テクスチャアトラス
export const FACE_ATLAS_KEY = 'image-face00';
export const FACE_ATLAS_PATH = `${import.meta.env.BASE_URL}textures/textures00/image_face00.webp`;
export const FACE_ATLAS_JSON_PATH = `${import.meta.env.BASE_URL}jsons/jsons00/sheet00-01.json`;

// 体テクスチャ
export const BODY_TEXTURE_KEY = 'image-body00';
export const BODY_TEXTURE_PATH = `${import.meta.env.BASE_URL}textures/textures00/image_body00.webp`;

/**
 * 顔アトラスのフレーム名
 */
export const FACE_ATLAS_PART = {
  // 顔ベース
  FACE_BASE: "face_base",
  // 後ろ髪
  HAIR_BACK: "hair_back",
}

/**
 * 表示オーダー
 */
export const DefineDepth = {
  BACKGROUND: -1,
  CHARACTER: 10,
  DEBUG_ANCHOR: 90,
  UI: 100,
}

// 背景色
export const BACKGROUND_COLOR = GetColorCodeByRGB(255, 255, 255);
// ラベルテキスト色
export const LABEL_TEXT_COLOR = GetColorCodeTextByRGB(60, 60, 60);
// ラベルテキストサイズ
export const LABEL_TEXT_SIZE = 30;