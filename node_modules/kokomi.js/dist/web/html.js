import * as THREE from "three";
import { Component } from "../components/component";
import { calcObjectPosition, calcTransformFov, epsilon, getCameraCSSMatrix, getObjectCSSMatrix, isObjectBehindCamera, isObjectVisible, objectZIndex, objectScale, } from "../utils";
/**
 * It can help you merge HTML elements into the WebGL world by converting 3D positions to 2D positions.
 * If element is visible, it will have a `visible` CSS class (can be customized), and for 2D position it will have 3 CSS variables `--x`, `--y` and `--z-index` (can be customized too)
 *
 * Demo: https://codesandbox.io/s/kokomi-js-html-w0qfmr?file=/src/components/sphereWordCloud.ts
 */
class Html extends Component {
    el;
    position;
    visibleClassName;
    xPropertyName;
    yPropertyName;
    zIndexPropertyName;
    scalePropertyName;
    viewportWidthName;
    viewportHeightName;
    perspectiveName;
    transformOuterName;
    transformInnerName;
    raycaster;
    occlude;
    transform;
    distanceFactor;
    parentGroup;
    group;
    visibleToggle;
    constructor(base, el, position = new THREE.Vector3(0, 0, 0), config = {}) {
        super(base);
        this.el = el;
        this.position = position;
        const { visibleClassName = "visible", xPropertyName = "--x", yPropertyName = "--y", zIndexPropertyName = "--z-index", scalePropertyName = "--scale", viewportWidthName = "--viewport-width", viewportHeightName = "--viewport-height", perspectiveName = "--perspective", transformOuterName = "--transform-outer", transformInnerName = "--transform-inner", occlude = [], transform = false, distanceFactor = 0, group = null, } = config;
        this.visibleClassName = visibleClassName;
        this.xPropertyName = xPropertyName;
        this.yPropertyName = yPropertyName;
        this.zIndexPropertyName = zIndexPropertyName;
        this.scalePropertyName = scalePropertyName;
        this.viewportWidthName = viewportWidthName;
        this.viewportHeightName = viewportHeightName;
        this.perspectiveName = perspectiveName;
        this.transformOuterName = transformOuterName;
        this.transformInnerName = transformInnerName;
        this.raycaster = new THREE.Raycaster();
        this.occlude = occlude;
        this.transform = transform;
        this.distanceFactor = distanceFactor;
        this.parentGroup = group;
        this.group = new THREE.Group();
        this.group.position.copy(this.position);
        this.visibleToggle = true;
    }
    get domPosition() {
        return calcObjectPosition(this.group, this.base.camera);
    }
    get zIndex() {
        return objectZIndex(this.group, this.base.camera);
    }
    get scale() {
        return !this.distanceFactor
            ? 1
            : objectScale(this.group, this.base.camera) * this.distanceFactor;
    }
    get isBehindCamera() {
        return isObjectBehindCamera(this.group, this.base.camera);
    }
    get isVisible() {
        return isObjectVisible(this.group, this.base.camera, this.raycaster, this.occlude);
    }
    get visible() {
        if (!this.visibleToggle) {
            return false;
        }
        if (this.occlude.length === 0) {
            return !this.isBehindCamera;
        }
        else {
            return !this.isBehindCamera && this.isVisible;
        }
    }
    get viewportSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
        };
    }
    get fov() {
        return calcTransformFov(this.base.camera);
    }
    get perspective() {
        return this.base.camera.isOrthographicCamera
            ? ""
            : this.fov;
    }
    get transformOuter() {
        const camera = this.base.camera;
        const { isOrthographicCamera, top, left, bottom, right } = camera;
        const { fov } = this;
        const widthHalf = window.innerWidth / 2;
        const heightHalf = window.innerHeight / 2;
        const cameraMatrix = getCameraCSSMatrix(camera.matrixWorldInverse);
        const cameraTransform = isOrthographicCamera
            ? `scale(${fov})translate(${epsilon(-(right + left) / 2)}px,${epsilon((top + bottom) / 2)}px)`
            : `translateZ(${fov}px)`;
        return `${cameraTransform}${cameraMatrix}translate(${widthHalf}px,${heightHalf}px)`;
    }
    get transformInner() {
        const matrix = this.group.matrixWorld;
        return getObjectCSSMatrix(matrix, 1 / ((this.distanceFactor || 10) / 400));
    }
    addExisting() {
        if (this.parentGroup) {
            this.parentGroup.add(this.group);
        }
        else {
            this.container.add(this.group);
        }
    }
    show() {
        this.el?.classList.add(this.visibleClassName);
    }
    hide() {
        this.el?.classList.remove(this.visibleClassName);
    }
    translate({ x = 0, y = 0 }) {
        this.el?.style.setProperty(this.xPropertyName, `${x}px`);
        this.el?.style.setProperty(this.yPropertyName, `${y}px`);
    }
    setZIndex(zIndex = 0) {
        this.el?.style.setProperty(this.zIndexPropertyName, `${zIndex}`);
    }
    setScale(scale = 1) {
        this.el?.style.setProperty(this.scalePropertyName, `${scale}`);
    }
    syncPosition() {
        this.translate(this.domPosition);
        this.setScale(this.scale);
        if (this.zIndex) {
            this.setZIndex(this.zIndex);
        }
        if (this.transform) {
            this.setTransformProperty();
        }
    }
    makeVisible() {
        this.visibleToggle = true;
    }
    makeInvisible() {
        this.visibleToggle = false;
    }
    update(time) {
        this.syncPosition();
        if (this.visible) {
            this.show();
        }
        else {
            this.hide();
        }
    }
    setTransformProperty() {
        this.el?.style.setProperty(this.viewportWidthName, `${this.viewportSize.width}px`);
        this.el?.style.setProperty(this.viewportHeightName, `${this.viewportSize.height}px`);
        this.el?.style.setProperty(this.perspectiveName, `${this.perspective}px`);
        this.el?.style.setProperty(this.transformOuterName, this.transformOuter);
        this.el?.style.setProperty(this.transformInnerName, this.transformInner);
    }
}
export { Html };
