// Replace object-hash with blueimp-md5,
// for the former requires crypto which browser doesn't have.
import { Material, MathUtils } from "three";
import md5 from "blueimp-md5";
import { defaultPatchMap, shaderMaterial_PatchMap } from "./patchMaps";
// @ts-ignore
import tokenize from "glsl-tokenizer";
// @ts-ignore
import stringify from "glsl-token-string";
// @ts-ignore
import tokenFunctions from "glsl-token-functions";
import { defaultDefinitions } from "./shaders";
const hash = (str) => md5(JSON.stringify(str));
const replaceAll = (str, find, rep) => str.split(find).join(rep);
const escapeRegExpMatch = function (s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
};
const isExactMatch = (str, match) => {
    return new RegExp(`\\b${escapeRegExpMatch(match)}\\b`).test(str);
};
function isConstructor(f) {
    try {
        // @ts-ignore
        new f();
    }
    catch (err) {
        if (err.message.indexOf("is not a constructor") >= 0) {
            return false;
        }
    }
    return true;
}
/**
 * Credit: https://github.com/FarazzShaikh/THREE-CustomShaderMaterial
 */
class CustomShaderMaterial extends Material {
    uniforms;
    _customPatchMap;
    _fs;
    _vs;
    _cacheKey;
    _base;
    _instanceID;
    _type;
    constructor({ baseMaterial, fragmentShader, vertexShader, uniforms, patchMap, cacheKey, ...opts }) {
        let base;
        if (isConstructor(baseMaterial)) {
            base = new baseMaterial(opts);
        }
        else {
            base = baseMaterial;
            Object.assign(base, opts);
        }
        if (base.type === "RawShaderMaterial") {
            throw new Error("CustomShaderMaterial does not support RawShaderMaterial");
        }
        super();
        this.uniforms = uniforms || {};
        this._customPatchMap = patchMap || {};
        this._fs = fragmentShader || "";
        this._vs = vertexShader || "";
        this._cacheKey = cacheKey;
        this._base = baseMaterial;
        this._type = base.type;
        this._instanceID = MathUtils.generateUUID();
        for (const key in base) {
            let k = key;
            if (key.startsWith("_")) {
                k = key.split("_")[1];
            }
            // @ts-ignore
            if (this[k] === undefined)
                this[k] = 0;
            // @ts-ignore
            this[k] = base[k];
        }
        this.update({ fragmentShader, vertexShader, uniforms, cacheKey });
    }
    update(opts) {
        const uniforms = opts?.uniforms || {};
        const fragmentShader = opts?.fragmentShader || this._fs;
        const vertexShader = opts?.vertexShader || this._vs;
        const serializedUniforms = Object.values(uniforms).reduce((prev, { value }) => {
            return prev + JSON.stringify(value);
        }, "");
        this.uuid =
            opts?.cacheKey?.() ||
                hash([
                    fragmentShader,
                    vertexShader,
                    serializedUniforms,
                    this._instanceID,
                ]);
        this.generateMaterial({
            fragmentShader,
            vertexShader,
            uniforms,
        });
    }
    clone() {
        // @ts-ignore
        const c = new this.constructor({
            baseMaterial: this._base,
            fragmentShader: this._fs,
            vertexShader: this._vs,
            patchMap: this._customPatchMap,
            uniforms: this.uniforms,
            cacheKey: this._cacheKey,
        });
        for (const key in this) {
            if (key === "uuid")
                continue;
            // @ts-ignore
            c[key] = this[key];
        }
        return c;
    }
    generateMaterial({ fragmentShader, vertexShader, uniforms, }) {
        const parsedFragmentShader = this.parseShader(fragmentShader);
        const parsedVertexShader = this.parseShader(vertexShader);
        this.uniforms = uniforms || {};
        this.customProgramCacheKey = () => {
            return this.uuid;
        };
        this.onBeforeCompile = (shader) => {
            if (parsedFragmentShader) {
                const patchedFragmentShader = this.patchShader(parsedFragmentShader, shader.fragmentShader);
                shader.fragmentShader =
                    this.getMaterialDefine() + patchedFragmentShader;
            }
            if (parsedVertexShader) {
                const patchedVertexShader = this.patchShader(parsedVertexShader, shader.vertexShader);
                shader.vertexShader = "#define IS_VERTEX;\n" + patchedVertexShader;
                shader.vertexShader = this.getMaterialDefine() + shader.vertexShader;
            }
            shader.uniforms = { ...shader.uniforms, ...this.uniforms };
            this.uniforms = shader.uniforms;
        };
        this.needsUpdate = true;
    }
    getMaterialDefine() {
        return `#define IS_${this._type.toUpperCase()};\n`;
    }
    getPatchMapForMaterial() {
        switch (this._type) {
            case "ShaderMaterial":
                return shaderMaterial_PatchMap;
            default:
                return defaultPatchMap;
        }
    }
    patchShader(customShader, shader) {
        let patchedShader = shader;
        const patchMap = {
            ...this.getPatchMapForMaterial(),
            ...this._customPatchMap,
        };
        Object.keys(patchMap).forEach((name) => {
            Object.keys(patchMap[name]).forEach((key) => {
                if (isExactMatch(customShader.main, name)) {
                    patchedShader = replaceAll(patchedShader, key, patchMap[name][key]);
                }
            });
        });
        patchedShader = patchedShader.replace("void main() {", `
          ${customShader.header}
          void main() {
            ${defaultDefinitions}
            ${customShader.main}
          `);
        patchedShader = customShader.defines + patchedShader;
        return patchedShader;
    }
    parseShader(shader) {
        if (!shader)
            return;
        // Strip comments
        const s = shader.replace(/\/\*\*(.*?)\*\/|\/\/(.*?)\n/gm, "");
        const tokens = tokenize(s);
        const funcs = tokenFunctions(tokens);
        const mainIndex = funcs
            .map((e) => {
            return e.name;
        })
            .indexOf("main");
        const variables = stringify(tokens.slice(0, mainIndex >= 0 ? funcs[mainIndex].outer[0] : undefined));
        const mainBody = mainIndex >= 0
            ? this.getShaderFromIndex(tokens, funcs[mainIndex].body)
            : "";
        return {
            defines: "",
            header: variables,
            main: mainBody,
        };
    }
    getShaderFromIndex(tokens, index) {
        return stringify(tokens.slice(index[0], index[1]));
    }
}
export { CustomShaderMaterial };
