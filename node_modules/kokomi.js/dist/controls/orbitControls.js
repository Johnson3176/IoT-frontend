import { Component } from "../components/component";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
/**
 * A drop-in orbitControls
 */
class OrbitControls extends Component {
    controls;
    constructor(base, config = {}) {
        super(base);
        const { enableDamping = true } = config;
        const controls = new OrbitControlsImpl(base.camera, base.renderer.domElement);
        this.controls = controls;
        controls.enableDamping = enableDamping;
    }
    update(time) {
        this.controls.update();
    }
}
export { OrbitControls };
