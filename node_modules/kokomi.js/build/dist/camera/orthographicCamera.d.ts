import * as THREE from "three";
export interface OrthographicCameraConfig {
    frustum: number;
    near: number;
    far: number;
    useAspect: boolean;
}
/**
 * A more friendly `THREE.OrthographicCamera`.
 */
declare class OrthographicCamera extends THREE.OrthographicCamera {
    frustum: number;
    useAspect: boolean;
    constructor(config?: Partial<OrthographicCameraConfig>);
}
export { OrthographicCamera };
