import { Component } from "../components/component";
import { ScreenQuad } from "./screenQuad";
/**
 * Also a screenQuad, but for Raymarching.
 * It's used with [marcher.js](https://github.com/alphardex/marcher.js)——a Raymarching code generator library.
 *
 * Demo: https://codesandbox.io/s/kokomi-js-raymarching-starter-lk17vs?file=/src/app.ts
 */
class RayMarchingQuad extends Component {
    screenQuad;
    marcher;
    constructor(base, marcher) {
        super(base);
        this.screenQuad = null;
        this.marcher = marcher;
    }
    render() {
        if (this.screenQuad) {
            this.container.remove(this.screenQuad.mesh);
        }
        const screenQuad = new ScreenQuad(this.base, {
            fragmentShader: this.marcher.fragmentShader,
            shadertoyMode: true,
        });
        screenQuad.addExisting();
        this.screenQuad = screenQuad;
    }
}
export { RayMarchingQuad };
