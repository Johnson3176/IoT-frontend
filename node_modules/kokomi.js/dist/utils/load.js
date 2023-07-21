import * as THREE from "three";
import { GLTFLoader, DRACOLoader, FBXLoader, RGBELoader, } from "three-stdlib";
// 加载视频贴图
const loadVideoTexture = (src, options = {}) => {
    const { unsuspend = "loadedmetadata", crossOrigin = "Anonymous", loop = true, muted = true, start = true, } = options;
    return new Promise((resolve) => {
        const video = Object.assign(document.createElement("video"), {
            src,
            crossOrigin,
            loop,
            muted,
            ...options,
        });
        const texture = new THREE.VideoTexture(video);
        video.addEventListener(unsuspend, () => {
            if (start) {
                texture.image.play();
            }
            resolve(texture);
        });
    });
};
let dracoLoader = null;
// 加载GLTF模型
const loadGLTF = (path, config = {}) => {
    const { useDraco = true } = config;
    return new Promise((resolve) => {
        const loader = new GLTFLoader();
        if (useDraco) {
            dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath(typeof useDraco === "string"
                ? useDraco
                : "https://www.gstatic.com/draco/versioned/decoders/1.4.3/");
            loader.setDRACOLoader(dracoLoader);
        }
        loader.load(path, (file) => {
            resolve(file);
        }, () => { }, () => {
            resolve(null);
        });
    });
};
// 加载FBX模型
const loadFBX = (path) => {
    return new Promise((resolve) => {
        const loader = new FBXLoader();
        loader.load(path, (file) => {
            resolve(file);
        }, () => { }, () => {
            resolve(null);
        });
    });
};
// 加载HDR
const loadHDR = (path) => {
    return new Promise((resolve) => {
        const loader = new RGBELoader();
        loader.load(path, (file) => {
            resolve(file);
        }, () => { }, () => {
            resolve(null);
        });
    });
};
export { loadVideoTexture, loadGLTF, loadFBX, loadHDR };
