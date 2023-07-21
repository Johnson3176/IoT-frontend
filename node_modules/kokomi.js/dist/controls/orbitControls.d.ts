import type { Base } from "../base/base";
import { Component } from "../components/component";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
export interface OrbitControlsConfig {
    enableDamping: boolean;
}
/**
 * A drop-in orbitControls
 */
declare class OrbitControls extends Component {
    controls: OrbitControlsImpl;
    constructor(base: Base, config?: Partial<OrbitControlsConfig>);
    update(time: number): void;
}
export { OrbitControls };
