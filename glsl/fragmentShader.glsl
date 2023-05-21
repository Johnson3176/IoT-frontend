// 片元着色器传入微粒颜色

uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;

varying vec2 vUv;

uniform vec3 uColor;

varying float vOpacity;
varying vec3 vPosition;

void main(){
    vec2 p=gl_PointCoord;
    
    vec3 col=uColor;
    
    gl_FragColor=vec4(col,1.);
}
