import * as THREE from "three";
import { Component } from "../components/component";
/**
 * A cute box mesh that we can see everywhere
 */
class Box extends Component {
    mesh;
    constructor(base, config = {}) {
        super(base);
        const { width = 0.2, height = 0.2, depth = 0.2, position = new THREE.Vector3(0, 0, 0), material = new THREE.MeshBasicMaterial({
            color: new THREE.Color("#ffffff"),
        }), } = config;
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        this.mesh = mesh;
    }
    addExisting() {
        this.container.add(this.mesh);
    }
    spin(time, axis = "y", speed = 1) {
        const mesh = this.mesh;
        mesh.rotation[axis] = (time / 1000) * speed;
    }
}
export { Box };
