// 0.导入相关库
import * as THREE from "three";
import Stats from "stats.js";  // 用于导入性能插件，显示性能信息
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";  // 用于鼠标移动视角
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";  // 用于加载3D模型
import { ThreeBSP } from "../node_modules/ThreeJs/js/ThreeBSP.js";  // 多个模型组合，如交并运算  &&  还存放有地板图片
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";

// 1.初始化场景
function initScene() {
    scene = new THREE.Scene();  // 创建场景对象
    scene.background = new THREE.Color(0x8cc7de);  // 设置场景背景色为蓝色
    scene.fog = new THREE.Fog(scene.background, 3000, 5000);  // 设置烟雾效果
}

// 2.初始化相机
function initCamera() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);  // 建立透视相机
    camera.position.set(0, 2500, 600);  // 设置相机在场景中的位置
    camera.lookAt(0, 0, 0);  // 看向原点

    // camera = new THREE.OrthographicCamera(-900,900,-900,900,0,900);  // 建立正交相机
    // camera.position.set(0,0,0);
}

// 3.初始化灯光
function initLight() {
    // 定向光源
    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.35);  // 模拟远处类似太阳的光源(颜色，光强)
    directionalLight.color.setHSL(0.1, 1, 0.95);  // 设置色调、饱和度、亮度
    directionalLight.position.set(0, 200, 100).normalize();  //设置光源的位置，并归一化
    scene.add(directionalLight);  // 将光源加入到场景中

    // 环境光源，针对Lambert材质
    var ambienLight = new THREE.AmbientLight(0xAAAAAA);  // 灰色
    scene.add(ambienLight);  // 将光源加入到场景中
}

// 4.初始化性能插件
// function initStats() {
// 	stats = new Stats();
// 	stats.domElement.style.position = 'absolute';  // 在网页中的绝对位置
// 	stats.domElement.style.left = '0px';  // 左侧像素
// 	stats.domElement.style.top = '0px';  // 顶侧像素
// 	document.body.appendChild(stats.domElement);  // 将插件加入到网页中
// 	return stats;
// }

// 5.初始化渲染器
function initRenderer() {
    renderer = new THREE.WebGLRenderer();
    const div_mid = document.getElementById("div_model");  // javascript中获取div元素，设置在网页的中间位置
    renderer.setSize(div_mid.clientWidth-20, div_mid.clientHeight-20);  // 设置和div具有相同的大小
    renderer.shadowMap.enabled = true;  // 启用阴影映射
    // 在场景中添加光源、模型中设置receiveShadow属性，呈现阴影
    div_mid.appendChild(renderer.domElement);
}

// 6.初始化内容

function createFloor() {
    // 建立地面几何对象
    var loader = new THREE.TextureLoader();  // 创建地面加载对象
    loader.load("./node_modules/ThreeJs/images/floor-sharp.jpg", function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 10);
        var floorGeometry = new THREE.BoxGeometry(1800, 1000, 2);  // 很薄的一张地面
        var floorMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        var floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.y = -20;
        floor.position.x = -200;
        floor.rotation.x = Math.PI / 2;

        floor.name = "地面";
        scene.add(floor);
    });

}

function createCubeWall(width, height, depth, angle, material, x, y, z, name) {
    // 创建墙
    var cubeGeometry = new THREE.BoxGeometry(width, height, depth);
    // cubeGeometry.opacity=1.0;
    cubeGeometry.transparent = true;
    var cube = new THREE.Mesh(cubeGeometry, material);
    cube.position.x = x;
    cube.position.y = y;
    cube.position.z = z;
    cube.rotation.y += angle * Math.PI;  // -逆时针旋转,+顺时针
    cube.name = name;
    scene.add(cube);
}

function createPlate(radius, material, x, y, z, name) {
    // 创建曝气盘
    var radialSegments = 64;  // 设置球面的光滑度，越大越光滑
    var plateGeometry = new THREE.SphereBufferGeometry(radius, radialSegments, radialSegments, 0, Math.PI * 2, 0, Math.PI * 0.5);
    var plate = new THREE.Mesh(plateGeometry, material);
    plate.position.x = x;
    plate.position.y = y;
    plate.position.z = z;
    plate.name = name;
    scene.add(plate);
    return plate;
}

function createStone(radius, height, material, x, y, z, name) {
    // 创建曝气石
    var radialSegments = 64;  // 设置球面的光滑度，越大越光滑
    // 曝气石组合体一共分为三个部分，先建立三个几何体对象:上半球、中间圆柱、下半球
    var stoneGeometry_part1 = new THREE.SphereBufferGeometry(radius, radialSegments, Math.round(radialSegments / 4), 0, Math.PI * 2, 0, Math.PI * 0.5);
    var stoneGeometry_part2 = new THREE.CylinderGeometry(radius, radius, height, radialSegments);
    // var stoneGeometry_part3 = new THREE.SphereBufferGeometry(radius, radialSegments, Math.round(radialSegments / 4), 0, Math.PI * 2, 0, Math.PI * 0.5);
    var stoneMesh_part1 = new THREE.Mesh(stoneGeometry_part1, material);
    var stoneMesh_part2 = new THREE.Mesh(stoneGeometry_part2, material);
    // var stoneMesh_part3 = new THREE.Mesh(stoneGeometry_part3, material);
    var stoneMesh_part3 = stoneMesh_part1.clone();

    // 曝气石组合体各部分位置调整，x,z相同，y根据高度调整
    stoneMesh_part1.position.set(x, y + height / 2, z);
    stoneMesh_part2.position.set(x, y, z);
    stoneMesh_part3.position.set(x, y - height / 2, z);
    stoneMesh_part3.rotation.x = Math.PI;  // 下半球旋转180°

    var stone = new THREE.Object3D();  // 创建3D对象，作为三个部分的整体组对象
    stone.add(stoneMesh_part1);
    stone.add(stoneMesh_part2);
    stone.add(stoneMesh_part3);

    stone.name = name;
    scene.add(stone);
}

function createBioreactor() {
    // 创建缺氧生物反应器
    var radiusSeg = 32;
    var heightSeg = 1;
    createCubeWall(10, 200, 200, 0, new THREE.MeshPhongMaterial({ color: 0xafc0ca }), ref_y - distBioReactor, 100, 0, "生物反应器-横板");

    var smallCylinderGeom = new THREE.CylinderGeometry(30, 30, 200, radiusSeg, heightSeg);  // 上半径、下半径、高度、圆面光滑度
    var largeCylinderGeom = new THREE.CylinderGeometry(40, 40, 200, radiusSeg, heightSeg);
    var cubeGeometry = new THREE.BoxGeometry(100, 200, 50);
    var material = new THREE.MeshLambertMaterial({ color: 0xafc0ca });
    var cube = new THREE.Mesh(cubeGeometry, material);
    cube.position.z = 25;
    var smallCylinderBSP = new ThreeBSP(smallCylinderGeom);
    var largeCylinderBSP = new ThreeBSP(largeCylinderGeom);
    var cubeBSP = new ThreeBSP(cube);

    var intersectionBSP = largeCylinderBSP.subtract(smallCylinderBSP);  // 外面的减去里面的
    var intersectionBSP1 = intersectionBSP.subtract(cubeBSP);  // 圆柱环减去一半
    var redMaterial = new THREE.MeshLambertMaterial({ color: 0xafc0ca });
    var hollowCylinder1 = intersectionBSP1.toMesh(redMaterial);
    var hollowCylinder2 = hollowCylinder1.clone();

    hollowCylinder1.position.set(ref_y - distBioReactor, 100, -100);
    hollowCylinder2.position.set(ref_y - distBioReactor, 100, 100);
    hollowCylinder2.rotation.y = Math.PI;

    scene.add(hollowCylinder1);
    scene.add(hollowCylinder2);
}

// function loadShader(fliename, onLoadShader) {  // 异步加载外部文件
// 	var request = new XMLHttpRequest();
// 	request.onreadystatechange = function () {
// 		if (request.readyState === 4 && request.status === 200) {
// 			onLoadShader(request.responseText);
// 		}
// 	};
// 	request.open("GET", fliename, true);
// 	request.send();
// }

function createBubble(x, y, z) {
    var radiusSeg = 32;
    var heightSeg = 1;
    var cylinderGeometry = new THREE.CylinderGeometry(10, 10, 100, radiusSeg, heightSeg);
    var material = new THREE.MeshLambertMaterial({ color: 0xafc0ca });
    var cylinderMesh = new THREE.Mesh(cylinderGeometry, material);
    var numSamples = 2000;
    var sampler = new MeshSurfaceSampler(cylinderMesh).build();  // 创建采样器
    var vertices = [];
    var tempPosition = new THREE.Vector3();


    // loadShader('./glsl/vertexShader.glsl', function (vsContent) {
    // 	vs = vsContent;
    // });
    // loadShader('./glsl/fragmentShader.glsl', function (fsContent) {
    // 	fs = fsContent;
    // });


    for (let i = 0; i < 800; i++) {
        sampler.sample(tempPosition);
        vertices.push(tempPosition.x, tempPosition.y, tempPosition.z);
    }
    var pointsGemometry = new THREE.BufferGeometry();
    pointsGemometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    // 直接创建微粒对象
    // var pointsMaterial = new THREE.PointsMaterial({
    // 	color:0xff61d5,
    // 	size:0.03
    // })

    // 通过着色器渲染微粒对象
    // var pointsMaterial = new THREE.ShaderMaterial({
    //     vertexShader: `
    //         // 顶点着色器传入微粒大小
    //         uniform float iTime;
    //         uniform vec2 iResolution;
    //         uniform vec2 iMouse;

    //         varying vec2 vUv;
    //         uniform float uPointSize;

    //         attribute float pIndex;
    //         varying float vOpacity;
    //         varying vec3 vPosition;

    //         void main(){
    //             vec3 p=position;
    //             gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
                
    //             vUv=uv;
    //             gl_PointSize=uPointSize;
    //         }
    //     `,
    //     fragmentShader: `
    //         // 片元着色器传入微粒颜色
    //         uniform float iTime;
    //         uniform vec2 iResolution;
    //         uniform vec2 iMouse;

    //         varying vec2 vUv;

    //         uniform vec3 uColor;

    //         varying float vOpacity;
    //         varying vec3 vPosition;
            
    //         void main(){
    //             vec2 p=gl_PointCoord;
    //             vec3 col=uColor;
    //             // float shape=spot(p,0.1,2.5);
    //             gl_FragColor=vec4(col,1);
    //         }
    //     `,
    //     uniforms: {
    //         uColor: { value: new THREE.Color("#fffafa"), },
    //         uPointSize: { value: 4, },
    //     }
    // });
    var points = new THREE.Points(pointsGemometry, pointsMaterial);

    var group = new THREE.Group();
    // group.add(points);
    // group.position.y = 300;
    // scene.add(group);
}

function createRefluxBump() {
    // 0x6aebf9
    // #908E91
    createCubeWall(99, 78, 78, 0, new THREE.MeshPhongMaterial({ color: 0x908e91 }), -440, 39, -130);
    createCubeWall(99, 78, 78, 0.5, new THREE.MeshPhongMaterial({ color: 0x908e91 }), -445, 39, 0);
    createCubeWall(99, 78, 78, 0, new THREE.MeshPhongMaterial({ color: 0x908e91 }), -440, 39, 130);
}

function createToptube() {
    createCubeWall(40, 10, 1100, 0.5, new THREE.MeshPhongMaterial({ color: 0xafc0ca, opacity: 0.7, transparent: true }), -130, 560, -100);
    // createCubeWall(25, 10, 1100, 0.5, new THREE.MeshPhongMaterial({ color: 0xfffe9f }), -200, 560, 100);
    createCubeWall(40, 10, 1100, 0.5, new THREE.MeshPhongMaterial({ color: 0xafc0ca, opacity: 0.7, transparent: true }), -130, 560, 100);
}

function createFans(x1, y1, z1, x2, y2, z2) {
    var obj;
    const loader = new OBJLoader();
    // load方法接受四个参数：OBJ文件路径，成功加载后的回调函数，加载过程中的回调函数和加载失败的回调函数
    loader.load(
        './3d_objs/Fan.obj',
        (object) => {
            var obj = new THREE.Object3D();  // 创建3D模型
            obj.add(object);

            fan1 = obj.clone();  // 复制模型对象，以便可以在场景中显示多个模型
            fan1.position.set(x1, y1, z1);
            fan1.rotation.x = -Math.PI / 2;
            fan1.scale.set(0.6, 0.6, 0.6);
            scene.add(fan1);

            fan2 = obj.clone();  // 复制模型对象，以便可以在场景中显示多个模型
            fan2.position.set(x2, y2, z2);
            fan2.rotation.x = -Math.PI / 2;
            fan2.scale.set(0.55, 0.55, 0.55);
            scene.add(fan2);
        },
        (xhr) => { console.log((xhr.loaded / xhr.total) * 100 + '% loaded'); },
        (error) => { console.error('Failed to load model', error); }

    );
}
function initContent() {
    createFloor();
    // 创建污水处理容器
    var opacity_set = 0.7
    createCubeWall(thicknessOuter, heightWall, lengthLeftWall, 0.5, new THREE.MeshPhongMaterial({ color: 0xfafafa, opacity: opacity_set, transparent: true }), ref_y - lengthLeftWall / 2, heightWall / 2, widthWall / 2, "进水曝气前墙面");
    createCubeWall(lengthLeftWall, thicknessOuter, widthWall, 0, new THREE.MeshPhongMaterial({ color: 0xfafafa, opacity: opacity_set, transparent: true }), ref_y - lengthLeftWall / 2, -thicknessOuter/2, 0, "进水曝气底面");
    createCubeWall(thicknessOuter, heightWall, widthWall, 0, new THREE.MeshPhongMaterial({ color: 0xfafafa, opacity: opacity_set, transparent: true }), ref_y - lengthLeftWall, heightWall / 2, 0, "进水曝气左墙面");
    createCubeWall(thicknessInner, heightDam, widthWall, 1, new THREE.MeshPhongMaterial({ color: 0xfafafa, opacity: opacity_set, transparent: true }), ref_y - distDam, heightDam / 2, 0, "左挡板");
    createCubeWall(thicknessInner, heightWall, widthWall, 1, new THREE.MeshPhongMaterial({ color: 0xfafafa, opacity: opacity_set, transparent: true }), ref_y - distPartWall, heightWall / 2, 0, "左隔层");
    createCubeWall(thicknessOuter, heightWall, widthWall, 1, new THREE.MeshPhongMaterial({ color: 0xfafafa, opacity: opacity_set, transparent: true }), ref_y, heightWall / 2, 0, "进水曝气右墙面");
    createCubeWall(thicknessOuter, heightWall, lengthLeftWall, 1.5, new THREE.MeshPhongMaterial({ color: 0xfafafa, opacity: opacity_set, transparent: true }), ref_y - lengthLeftWall / 2, heightWall / 2, -widthWall / 2, "进水曝气后墙面");
    createCubeWall(thicknessOuter, heightWall, lengthMiddleWall, 0.5, new THREE.MeshPhongMaterial({ color: 0xfafafa, opacity: opacity_set, transparent: true }), ref_y + distLeftMiddle + lengthMiddleWall / 2, heightWall / 2, widthWall / 2, "出水前墙面");
    createCubeWall(lengthMiddleWall, thicknessOuter, widthWall, 0, new THREE.MeshPhongMaterial({ color: 0xfafafa, opacity: opacity_set, transparent: true }), ref_y + distLeftMiddle + lengthMiddleWall / 2, -thicknessOuter/2, 0, "出水底面");
    createCubeWall(thicknessOuter, heightWall, widthWall, 1, new THREE.MeshPhongMaterial({ color: 0xfafafa, opacity: opacity_set, transparent: true }), ref_y + distLeftMiddle, heightWall / 2, 0, "出水左墙面");
    createCubeWall(thicknessOuter, heightWall, widthWall, 1, new THREE.MeshPhongMaterial({ color: 0xfafafa, opacity: opacity_set, transparent: true }), ref_y + distLeftMiddle + lengthMiddleWall, heightWall / 2, 0, "出水右墙面");
    createCubeWall(thicknessOuter, heightWall, lengthMiddleWall, 0.5, new THREE.MeshPhongMaterial({ color: 0xfafafa, opacity: opacity_set, transparent: true }), ref_y + distLeftMiddle + lengthMiddleWall / 2, heightWall / 2, -widthWall / 2, "出水后墙面");

    //创建缺氧生物反应器
    // createBioreactor();

    // 创建曝气装置及气管
    // createCubeWall(100, 78, 56, 0.5, new THREE.MeshPhongMaterial({ color: 0xafc0ca }), -100, 500, -300, "进水曝气前墙面");
    p1 = createPlate(40, new THREE.MeshPhongMaterial({ color: 0xffc0ca }), ref_y - 300, 0, -(widthWall / 2 - 50), "曝气盘1");
    p2 = createPlate(40, new THREE.MeshPhongMaterial({ color: 0xffc0ca }), ref_y - 100, 0, -(widthWall / 2 - 50), "曝气盘2");
    p3 = createPlate(40, new THREE.MeshPhongMaterial({ color: 0xffc0ca }), ref_y - 300, 0, 0, "曝气盘3");
    p4 = createPlate(40, new THREE.MeshPhongMaterial({ color: 0xffc0ca }), ref_y - 100, 0, 0, "曝气盘4");
    p5 = createPlate(40, new THREE.MeshPhongMaterial({ color: 0xffc0ca }), ref_y - 300, 0, widthWall / 2 - 50, "曝气盘5");
    p6 = createPlate(40, new THREE.MeshPhongMaterial({ color: 0xffc0ca }), ref_y - 100, 0, widthWall / 2 - 50, "曝气盘6");

    createStone(stoneRadius, stoneHeight, new THREE.MeshPhongMaterial({ color: 0xadff2f }), ref_y - 350, stone2floor, -widthWall / 4 + 20, "曝气石1");
    createStone(stoneRadius, stoneHeight, new THREE.MeshPhongMaterial({ color: 0xadff2f }), ref_y - 240, stone2floor, -widthWall / 4 + 20, "曝气石2");
    createStone(stoneRadius, stoneHeight, new THREE.MeshPhongMaterial({ color: 0xadff2f }), ref_y - 160, stone2floor, -widthWall / 4 + 20, "曝气石3");
    createStone(stoneRadius, stoneHeight, new THREE.MeshPhongMaterial({ color: 0xadff2f }), ref_y - 50, stone2floor, -widthWall / 4 + 20, "曝气石4");
    createStone(stoneRadius, stoneHeight, new THREE.MeshPhongMaterial({ color: 0xadff2f }), ref_y - 350, stone2floor, widthWall / 4 - 20, "曝气石5");
    createStone(stoneRadius, stoneHeight, new THREE.MeshPhongMaterial({ color: 0xadff2f }), ref_y - 240, stone2floor, widthWall / 4 - 20, "曝气石6");
    createStone(stoneRadius, stoneHeight, new THREE.MeshPhongMaterial({ color: 0xadff2f }), ref_y - 160, stone2floor, widthWall / 4 - 20, "曝气石7");
    createStone(stoneRadius, stoneHeight, new THREE.MeshPhongMaterial({ color: 0xadff2f }), ref_y - 50, stone2floor, widthWall / 4 - 20, "曝气石8");


    // 创建气泡效果，首先以一个圆柱为例
    // createBubble();

    // 创建桨叶及电线
    createFans(-distFan, heightWall - axisLengthFan1, 100, -distFan, heightWall - axisLengthFan2, -100);

    // 创建顶部管道
    createToptube();

    // 创建气泵
    createRefluxBump()

    // 创建传感器

}
// 初始化轨迹球控件
function initControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.5;
    // 视角最小距离
    controls.minDistance = 500;
    // 视角最远距离
    controls.maxDistance = 3000;
    // 最大角度
    controls.maxPolarAngle = Math.PI / 2.2;
}

// 更新控件
function update() {
    // stats.update();
    controls.update();
}

// final.总初始化
function init() {
    initScene();
    initCamera();
    initLight();
    // initStats();
    initRenderer();
    initContent();
    initControls();
}


// 动画效果 相当于一个循环函数，在用户打开其他界面时不会占用资源
function animate() {
    requestAnimationFrame(animate);
    if (fan1 && fan2) {
        fan1.rotation.z += fan_base_v * sf1 * 0.5;
        fan2.rotation.z += fan_base_v * sf2 * 0.5;
    }
    if (sb1)
        p1.material.color.set(0xff0000);
    else
        p1.material.color.set(0xffc0ca);
    if (sb2)
        p2.material.color.set(0xff0000);
    else
        p2.material.color.set(0xffc0ca);
    if (sb3)
        p3.material.color.set(0xff0000);
    else
        p3.material.color.set(0xffc0ca);
    if (sb4)
        p4.material.color.set(0xff0000);
    else
        p4.material.color.set(0xffc0ca);
    if (sb5)
        p5.material.color.set(0xff0000);
    else
        p5.material.color.set(0xffc0ca);
    if (sb6)
        p6.material.color.set(0xff0000);
    else
        p6.material.color.set(0xffc0ca);

    // 渲染
    renderer.render(scene, camera);
    update();
}
init();
animate();
