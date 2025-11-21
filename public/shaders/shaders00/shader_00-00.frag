#ifdef GL_ES
precision mediump float;
#endif

// 円運動する光

// time
uniform float time;
// resolution
uniform vec2 resolution;
// alpha(custom)
uniform float uAlpha;
// pixel position (phaser game object)
varying vec2 fragCoord;

void main( void ) {
    float t = time;
    vec2 r = resolution;

    vec2 p = (fragCoord.xy * 2.0 - r) / min(r.x, r.y);
    
    float f = 0.0;
    for (float i = 0.0; i < 6.0; i++) {
        float rad = t * (i + 1.0);
        // iが偶数なら1.0 奇数なら-1.0
        //float coef = mod(i, 2.0) * 2.0 - 1.0;
        float coef = 1.0;
        float s = sin(rad);
        float c = cos(rad);
        mat2 m = mat2(c * coef, -s * coef, s, c);
        p *= m;

        vec2 q = vec2(p.x - (0.033 * (6.0 - i)), p.y);
        f += 0.011 / length(q);
    }
    
    // f を 1~0 の範囲に収める
    f = smoothstep(0.06, 1.0, f);
    
    vec3 color = vec3(0.0, f, f);
    
    // 意図したいブレンドモード
    // glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    // finalColor = srcAlpha * srcColor + (1 - srcAlpha) * dstColor;
    // src 描画元(これから描画されようとする色)
    // dst 描画先(既に描画されている色)
    
    // rgbの値をalpha値としてのユニフォーム変数uAlphaで乗算
    // gl_FragColorに渡す第四引数は感覚的に次の通りとなる。
    // colorが黒の場合
    // 0.0: 黒い透明を完全に透明にする。(既に描画されているブレンド割合が1)
    // 1.0: 黒い部分を黒く描画する。(既に描画されている色をブレンド割合が無)
    // なので通常は0にしておくと意図的なブレンドになる
    //gl_FragColor = vec4(color * uAlpha, 0.0);
    
    // 正しくは以下か？colorへの乗算と透明度の指定
    gl_FragColor = vec4(color * uAlpha, uAlpha);
}