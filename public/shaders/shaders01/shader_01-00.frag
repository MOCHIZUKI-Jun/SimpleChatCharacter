#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;
uniform float uAlpha;
varying vec2 fragCoord;

// ==== HSV→RGB ====
vec3 hsv2rgb(vec3 c){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0,0.0,1.0);
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

// ==== 簡易ノイズ ====
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(
        mix(hash(i+vec2(0.0,0.0)), hash(i+vec2(1.0,0.0)), u.x),
        mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x),
        u.y
    );
}

void main(void){
    vec2 r = resolution;
    vec2 p = (fragCoord.xy * 2.0 - r) / min(r.x, r.y);
    vec2 baseP = p;
    float t = time * 0.5;

    // ===== 万華鏡的反射処理 =====
    p = abs(mod(p*3.0, 2.0) - 1.0);  // 反射タイルで左右上下対称
    float angle = atan(p.y, p.x);
    float radius = length(p);

    // ===== 幾何＋ノイズの動き =====
    float n = noise(vec2(angle*2.0, radius*2.5 + t*0.6));
    float pattern = sin(radius*12.0 - t*2.0 + n*6.2831)
    + cos(angle*10.0 + t*1.3)
    + sin(dot(p, p*4.0) - t*0.9);

    // トゥーン階調っぽく3段階化
    float stepped = floor(pattern * 2.5) / 2.5;
    float edge = smoothstep(0.05, 0.0, abs(fract(pattern*2.0)-0.5));

    // ===== 色 =====
    float hue = fract(0.3 + 0.2*sin(t*0.4) + stepped*0.15 + n*0.3);
    float sat = 0.6 + 0.3*sin(t + n*6.0);
    float val = 0.9 + 0.1*sin(t*1.2 + radius*8.0);

    vec3 color = hsv2rgb(vec3(hue, sat, val));
    color *= (0.7 + 0.3 * stepped);
    color = mix(color, vec3(1.0), edge*0.3);

    // ===== 出力 =====
    color = pow(color, vec3(0.9));

    // 外側にフェードアウト
    float dist = length(baseP);
    float thresDist = 0.98;
    float fadeLength = 0.0022;
    color *= smoothstep(thresDist, thresDist - fadeLength, dist);
    
    gl_FragColor = vec4(color * uAlpha, uAlpha);
}