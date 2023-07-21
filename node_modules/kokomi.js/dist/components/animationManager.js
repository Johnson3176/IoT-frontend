import * as THREE from "three";
import { Component } from "./component";
/**
 * This class can manage the animations of a model.
 */
class AnimationManager extends Component {
    clips;
    root;
    mixer;
    constructor(base, clips, root) {
        super(base);
        this.clips = clips;
        this.root = root;
        this.mixer = new THREE.AnimationMixer(root);
    }
    get names() {
        return this.clips.map((item) => item.name);
    }
    get actions() {
        return Object.fromEntries(this.clips.map((item) => [item.name, this.mixer.clipAction(item)]));
    }
    update() {
        this.mixer.update(this.base.clock.deltaTime);
    }
}
export { AnimationManager };
