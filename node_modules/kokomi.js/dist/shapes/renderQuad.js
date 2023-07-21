import * as THREE from "three";
import { CustomMesh } from "./customMesh";
/**
 * A render plane for RenderTexture.
 */
class RenderQuad extends CustomMesh {
    constructor(base, map, config = {}) {
        super(base, {
            vertexShader: "",
            fragmentShader: "",
            baseMaterial: new THREE.MeshBasicMaterial(),
            geometry: config.geometry ||
                new THREE.PlaneGeometry(window.innerWidth, window.innerHeight),
            materialParams: {
                map,
                transparent: true,
                ...config.materialParams,
            },
        });
    }
}
export { RenderQuad };
