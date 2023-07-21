import * as THREE from "three";
// 制作buffer
const makeBuffer = (count = 100, fn, dimension = 3) => {
    const buffer = Float32Array.from({ length: count * dimension }, (v, k) => {
        return fn(k);
    });
    return buffer;
};
// 迭代buffer
const iterateBuffer = (buffer, count, fn, dimension = 3) => {
    for (let i = 0; i < count; i++) {
        const axis = i * dimension;
        const x = axis;
        const y = axis + 1;
        const z = axis + 2;
        const w = axis + 3;
        fn(buffer, { x, y, z, w }, i);
    }
};
// 将bufferAttribute转为向量
const convertBufferAttributeToVector = (bufferAttribute, dimension = 3) => {
    const vectorDimensionMap = {
        2: new THREE.Vector2(),
        3: new THREE.Vector3(),
        4: new THREE.Vector4(),
    };
    const vectors = Array.from({ length: bufferAttribute.array.length / dimension }, (v, k) => {
        const vector = vectorDimensionMap[dimension].clone();
        return vector.fromBufferAttribute(bufferAttribute, k);
    });
    return vectors;
};
const isVector = (v) => v instanceof THREE.Vector2 ||
    v instanceof THREE.Vector3 ||
    v instanceof THREE.Vector4;
const normalizeVector = (v) => {
    if (Array.isArray(v))
        return v;
    else if (isVector(v))
        return v.toArray();
    return [v, v, v];
};
const isFloat32Array = (def) => def && def.constructor === Float32Array;
const expandColor = (v) => [v.r, v.g, v.b];
const usePropAsIsOrAsAttribute = (count, prop, setDefault) => {
    if (prop !== undefined) {
        if (isFloat32Array(prop)) {
            return prop;
        }
        else {
            if (prop instanceof THREE.Color) {
                const a = Array.from({ length: count * 3 }, () => expandColor(prop)).flat();
                return Float32Array.from(a);
            }
            else if (isVector(prop) || Array.isArray(prop)) {
                const a = Array.from({ length: count * 3 }, () => normalizeVector(prop)).flat();
                return Float32Array.from(a);
            }
            return Float32Array.from({ length: count }, () => prop);
        }
    }
    return Float32Array.from({ length: count }, setDefault);
};
export { makeBuffer, iterateBuffer, convertBufferAttributeToVector, isVector, normalizeVector, isFloat32Array, expandColor, usePropAsIsOrAsAttribute, };
