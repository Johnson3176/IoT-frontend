const computeContainerPosition = (canvasSize, trackRect) => {
    const { right, top, left: trackLeft, bottom: trackBottom, width, height, } = trackRect;
    const isOffscreen = trackRect.bottom < 0 ||
        top > canvasSize.height ||
        right < 0 ||
        trackRect.left > canvasSize.width;
    const canvasBottom = canvasSize.top + canvasSize.height;
    const bottom = canvasBottom - trackBottom;
    const left = trackLeft - canvasSize.left;
    return {
        position: { width, height, left, top, bottom, right },
        isOffscreen,
    };
};
// 应用视图裁剪，用于把画布放在一个div视图容器内
const applyViewScissor = (base, viewEl) => {
    const canvasSize = base.renderer.domElement.getBoundingClientRect();
    const rect = viewEl.getBoundingClientRect();
    if (rect) {
        const { position: { left, bottom, width, height }, } = computeContainerPosition(canvasSize, rect);
        const aspect = width / height;
        base.camera.aspect = aspect;
        base.camera.updateProjectionMatrix();
        base.renderer.setViewport(left, bottom, width, height);
        base.renderer.setScissor(left, bottom, width, height);
        base.renderer.setScissorTest(true);
    }
};
// 计算视图窗口缩放，用于在div视图容器内HTML元素的缩放
const computeViewWindowScale = (viewEl) => {
    const viewRect = viewEl.getBoundingClientRect();
    const { width, height } = viewRect;
    const xScale = width / window.innerWidth;
    const yScale = height / window.innerHeight;
    return { xScale, yScale };
};
export { applyViewScissor, computeViewWindowScale };
