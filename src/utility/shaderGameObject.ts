import Phaser from "phaser";


/**
 * シェーダーゲームオブジェクト
 */
export class ShaderGameObject extends Phaser.GameObjects.Container {

  private readonly shaderKey!: string;
  private shaderObject?: Phaser.GameObjects.Shader;
  
  /**
   * コンストラクタ
   */
  constructor(scene: Phaser.Scene, width: number, height: number, shaderKey: string) {
    super(scene, 0, 0);
    scene.add.existing(this);
    
    // シェーダーキー
    this.shaderKey = shaderKey;

    // 自身のサイズ
    this.setSize(width, height);
    
    // シェーダーオブジェクト作成
    this.addShaderObject();
  }
  
  /**
   * alpha値用ユニフォーム変数をセット
   */
  public setUniformAlpha(alpha: number) {
    this.shaderObject?.setUniform('uAlpha.value', alpha);
  }
  
  private addShaderObject() {
    const width = this.width;
    const height = this.height;
    const fragShaderText = this.scene.cache.text.get(this.shaderKey);
    const baseShaderKey = `baseShader${this.shaderKey}`;
    const baseShader = new Phaser.Display.BaseShader(
      baseShaderKey,
      fragShaderText,
      undefined,
      {
        uAlpha: { type: '1f', value: 1.0 }
      }
    );
    this.shaderObject = this.scene.add.shader(baseShader, 0, 0, width, height);
    this.shaderObject.setPointer(this.scene.input.activePointer);
    
    // ブレンドモードの設定 NOTE: 変化なし
    //this.shaderObject.gl.enable(WebGLRenderingContext.BLEND);
    //this.shaderObject.gl.blendFunc(WebGLRenderingContext.SRC_ALPHA, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA);
    
    this.add(this.shaderObject);
  }
}