import * as THREE from "three";
import { Component } from "../components/component";
import { CustomShaderMaterial, } from "../lib/THREE-CustomShaderMaterial";
import { UniformInjector } from "../components/uniformInjector";
const defaultVertexShader = /* glsl */ `
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;

varying vec2 vUv;

uniform float uPointSize;

void main(){
    vec3 p=position;
    csm_Position=p;

    gl_PointSize=uPointSize;
    
    vUv=uv;
}
`;
const defaultFragmentShader = /* glsl */ `
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;

varying vec2 vUv;

void main(){
    vec2 p=vUv;
    vec3 col=vec3(p,0.);
    
    csm_DiffuseColor=vec4(col,1.);
}

`;
/**
 * It contains a `THREE.Points` object in which you can custom its base material (which is based on [THREE-CustomShaderMaterial](https://github.com/FarazzShaikh/THREE-CustomShaderMaterial)).
 * Also, it provides all the shadertoy uniforms.
 *
 * Demo: https://kokomi-js.vercel.app/examples/#customPoints
 */
class CustomPoints extends Component {
    material;
    points;
    uniformInjector;
    constructor(base, config = {}) {
        super(base);
        const { geometry = new THREE.PlaneGeometry(1, 1, 16, 16), baseMaterial = new THREE.ShaderMaterial(), vertexShader = defaultVertexShader, fragmentShader = defaultFragmentShader, uniforms = {}, patchMap = {}, materialParams = {}, } = config;
        const uniformInjector = new UniformInjector(base);
        this.uniformInjector = uniformInjector;
        const material = new CustomShaderMaterial({
            baseMaterial,
            vertexShader,
            fragmentShader,
            uniforms: {
                ...uniformInjector.shadertoyUniforms,
                ...{
                    uPointSize: {
                        value: 10,
                    },
                },
                ...uniforms,
            },
            patchMap,
            ...materialParams,
        });
        this.material = material;
        const points = new THREE.Points(geometry, material);
        this.points = points;
    }
    addExisting() {
        this.container.add(this.points);
    }
    update(time) {
        const uniforms = this.material.uniforms;
        this.uniformInjector.injectShadertoyUniforms(uniforms);
    }
}
export { CustomPoints };
