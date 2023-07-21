import { FontLoader, TextGeometry, } from "three-stdlib";
import { CustomMesh } from "./customMesh";
const defaultFontUrl = "https://unpkg.com/three@0.77.0/examples/fonts/helvetiker_regular.typeface.json";
const loadFont = (url = defaultFontUrl) => {
    return new Promise((resolve) => {
        new FontLoader().load(url, (font) => {
            resolve(font);
        });
    });
};
/**
 * A mesh using `TextGeometry` to render 3D text.
 *
 * Demo: https://kokomi-js.vercel.app/examples/#text3D
 */
class Text3D extends CustomMesh {
    constructor(base, text, font, textParams = {
        size: 0.5,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        // @ts-ignore
        bevelSegments: 5,
    }, config = {}) {
        super(base, {
            geometry: new TextGeometry(text, { ...textParams, font }),
            ...config,
        });
    }
}
export { loadFont, Text3D };
