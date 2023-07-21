import { Mesh, Scene, WebGLRenderTarget, WebGLRenderer, Camera } from "three";
import { ConvolutionMaterial } from "./ConvolutionMaterial";
export interface BlurPassProps {
    gl: WebGLRenderer;
    resolution: number;
    width?: number;
    height?: number;
    minDepthThreshold?: number;
    maxDepthThreshold?: number;
    depthScale?: number;
    depthToBlurRatioBias?: number;
}
export declare class BlurPass {
    renderTargetA: WebGLRenderTarget;
    renderTargetB: WebGLRenderTarget;
    convolutionMaterial: ConvolutionMaterial;
    scene: Scene;
    camera: Camera;
    screen: Mesh;
    renderToScreen: boolean;
    constructor({ gl, resolution, width, height, minDepthThreshold, maxDepthThreshold, depthScale, depthToBlurRatioBias, }: BlurPassProps);
    render(renderer: WebGLRenderer, inputBuffer: WebGLRenderTarget, outputBuffer: WebGLRenderTarget): void;
}
