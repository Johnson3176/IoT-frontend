// 顶点着色器传入微粒大小
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;

varying vec2 vUv;

uniform float uPointSize;

attribute float pIndex;

varying float vOpacity;
varying vec3 vPosition;

void main(){
    vec3 p=position;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
    
    vUv=uv;
    gl_PointSize=uPointSize;
}
