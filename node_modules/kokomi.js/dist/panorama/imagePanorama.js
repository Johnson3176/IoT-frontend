import * as THREE from "three";
import { BasicPanorama } from "./basicPanorama";
/**
 * First you should add `kokomi.Viewer`, which automatically adds proper camera and orbitControls to your scene.
 * Then load your image asset with `kokomi.AssetManager`. After this, you can use `kokomi.ImagePanorama` to get the panorama scene and add it to the viewer.
 */
class ImagePanorama extends BasicPanorama {
    constructor(base, texture, config = {}) {
        super(base);
        const { id = "", radius = 5000 } = config;
        this.id = id;
        const geometry = new THREE.SphereGeometry(radius, 60, 40);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide,
            transparent: true,
            opacity: 1,
        });
        this.material = material;
        const mesh = new THREE.Mesh(geometry, material);
        this.mesh = mesh;
    }
}
export { ImagePanorama };
