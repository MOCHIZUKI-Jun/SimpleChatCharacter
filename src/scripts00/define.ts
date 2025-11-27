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

// 横髪テクスチャ
export const HAIR_SIDE_L_TEXTURE_KEY = 'image-hair-sideL00';
export const HAIR_SIDE_L_TEXTURE_PATH = `${import.meta.env.BASE_URL}textures/textures00/image_face00_sidehairL.webp`;
export const HAIR_SIDE_R_TEXTURE_KEY = 'image-hair-sideR00';
export const HAIR_SIDE_R_TEXTURE_PATH = `${import.meta.env.BASE_URL}textures/textures00/image_face00_sidehairR.webp`;

// 体テクスチャ
export const BODY_TEXTURE_KEY = 'image-body00';
export const BODY_TEXTURE_PATH = `${import.meta.env.BASE_URL}textures/textures00/image_body00.webp`;

// 口テクスチャ
export const MOUTH_TEXTURE_KEY = 'image-mouth00';
export const MOUTH_TEXTURE_PATH = `${import.meta.env.BASE_URL}textures/textures00/image_face00_mouth.png`;

// 尻尾テクスチャ
export const TAIL_TEXTURE_KEY = 'image-tail00';
export const TAIL_TEXTURE_PATH = `${import.meta.env.BASE_URL}textures/textures00/image_tail00.webp`;

// 吹き出しテクスチャ
export const MESSAGE_TEXTURE_KEY = 'image-msg-back00';
export const MESSAGE_TEXTURE_PATH = `${import.meta.env.BASE_URL}textures/textures00/image_msg_back.webp`;

/**
 * 顔アトラスのフレーム名
 */
export const FACE_ATLAS_PART = {
  // 顔ベース
  FACE_BASE: "face_base",
  // 後ろ髪
  HAIR_BACK: "hair_back",
  // 前髪
  HAIR_FRONT: "hair_front",
  // 右目開
  EYE_RIGHT_OPEN: "eye_right_open",
  // 右目閉
  EYE_RIGHT_CLOSED: "eye_right_closed0",
  // 左目開
  EYE_LEFT_OPEN: "eye_left_open",
  // 左目閉
  EYE_LEFT_CLOSED: "eye_left_closed0",
  // 右眉
  EYEBROW_RIGHT: "eyebrow_right",
  // 左眉
  EYEBROW_LEFT: "eyebrow_left",
  // 口(閉)
  MOUTH_CLOSED: "mouth_small",
  // 右角
  HORN_RIGHT: "horn_right",
  // 左角
  HORN_LEFT: "horn_left",
  // 王冠
  CROWN: "crown",
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
// テキスト色
export const TEXT_COLOR = GetColorCodeTextByRGB(60, 60, 60);
// テキストサイズ
export const TEXT_SIZE = 30;

// 入力フィールドバーの高さ
export const INPUT_FIELD_BAR_HEIGHT = 50;