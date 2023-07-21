import * as THREE from "three";
import type { Base } from "../base/base";
import { Component } from "../components/component";
import { BlurPass } from "../lib/other/BlurPass";
import { MeshReflectorMaterialImpl } from "../lib/other/MeshReflectorMaterial";
export interface MeshReflectorMaterialConfig {
    resolution: number;
    mixBlur: number;
    mixStrength: number;
    blur: [number, number] | number;
    mirror: number;
    ignoreObjects: THREE.Object3D[];
}
/**
 * A material for reflection, which has blur support.
 */
declare class MeshReflectorMaterial extends Component {
    parent: THREE.Mesh;
    material: MeshReflectorMaterialImpl;
    virtualCamera: THREE.PerspectiveCamera;
    fbo1: THREE.WebGLRenderTarget;
    fbo2: THREE.WebGLRenderTarget;
    blurpass: BlurPass;
    hasBlur: boolean;
    ignoreObjects: THREE.Object3D[];
    beforeRender: () => void;
    constructor(base: Base, parent: THREE.Mesh, config?: Partial<MeshReflectorMaterialConfig>);
    update(time: number): void;
}
export { MeshReflectorMaterial };
