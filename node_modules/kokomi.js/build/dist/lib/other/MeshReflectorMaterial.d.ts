import { Matrix4, MeshStandardMaterial, Texture } from "three";
type UninitializedUniform<Value> = {
    value: Value | null;
};
export declare class MeshReflectorMaterialImpl extends MeshStandardMaterial {
    _tDepth: UninitializedUniform<Texture>;
    _distortionMap: UninitializedUniform<Texture>;
    _tDiffuse: UninitializedUniform<Texture>;
    _tDiffuseBlur: UninitializedUniform<Texture>;
    _textureMatrix: UninitializedUniform<Matrix4>;
    _hasBlur: {
        value: boolean;
    };
    _mirror: {
        value: number;
    };
    _mixBlur: {
        value: number;
    };
    _blurStrength: {
        value: number;
    };
    _minDepthThreshold: {
        value: number;
    };
    _maxDepthThreshold: {
        value: number;
    };
    _depthScale: {
        value: number;
    };
    _depthToBlurRatioBias: {
        value: number;
    };
    _distortion: {
        value: number;
    };
    _mixContrast: {
        value: number;
    };
    constructor(parameters?: {});
    onBeforeCompile(shader: any): void;
    get tDiffuse(): Texture | null;
    set tDiffuse(v: Texture | null);
    get tDepth(): Texture | null;
    set tDepth(v: Texture | null);
    get distortionMap(): Texture | null;
    set distortionMap(v: Texture | null);
    get tDiffuseBlur(): Texture | null;
    set tDiffuseBlur(v: Texture | null);
    get textureMatrix(): Matrix4 | null;
    set textureMatrix(v: Matrix4 | null);
    get hasBlur(): boolean;
    set hasBlur(v: boolean);
    get mirror(): number;
    set mirror(v: number);
    get mixBlur(): number;
    set mixBlur(v: number);
    get mixStrength(): number;
    set mixStrength(v: number);
    get minDepthThreshold(): number;
    set minDepthThreshold(v: number);
    get maxDepthThreshold(): number;
    set maxDepthThreshold(v: number);
    get depthScale(): number;
    set depthScale(v: number);
    get depthToBlurRatioBias(): number;
    set depthToBlurRatioBias(v: number);
    get distortion(): number;
    set distortion(v: number);
    get mixContrast(): number;
    set mixContrast(v: number);
}
export type MeshReflectorMaterialProps = {
    mixBlur: number;
    mixStrength: number;
    mirror: number;
    textureMatrix: Matrix4;
    tDiffuse: Texture;
    distortionMap?: Texture;
    tDiffuseBlur: Texture;
    hasBlur: boolean;
    minDepthThreshold: number;
    maxDepthThreshold: number;
    depthScale: number;
    depthToBlurRatioBias: number;
    distortion: number;
    mixContrast: number;
};
export {};
