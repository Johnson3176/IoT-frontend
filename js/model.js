// 0.导入相关库
import * as THREE from "three";
import Stats from "stats.js";  // 用于导入性能插件，显示性能信息
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";  // 用于鼠标移动视角
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";  // 用于加载3D模型
import { Water } from "three/examples/jsm/objects/Water2";

import { ThreeBSP } from "../ThreeJs/js/ThreeBSP.js";  // 多个模型组合，如交并运算  &&  还存放有地板图片
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import * as kokomi from "kokomi.js";

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

// 4.初始化渲染器
function initRenderer() {
    renderer = new THREE.WebGLRenderer();
    const div_mid = document.getElementById("div_model");  // javascript中获取div元素，设置在网页的中间位置
    renderer.setSize(div_mid.clientWidth-20, div_mid.clientHeight-20);  // 设置和div具有相同的大小
    renderer.shadowMap.enabled = true;  // 启用阴影映射
    // 在场景中添加光源、模型中设置receiveShadow属性，呈现阴影
    div_mid.appendChild(renderer.domElement);
}

// 5.初始化内容

function createFloor() {
    // 建立地面几何对象
    var loader = new THREE.TextureLoader();  // 创建地面加载对象
    loader.load("./images/floor-sharp.jpg", function (texture) {
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

    // 此处有一个bug！！！！  stoneMesh_part1和stone共用颜色
    return stoneMesh_part1;
}

function createWater(){
    // 创建用于水面的平面几何体
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

    // // 创建 Water 对象所需的选项
    // const waterOptions = {
    // color: '#abcdef', // 水体颜色
    // scale: 4, // 波浪大小
    // flowDirection: new THREE.Vector2(1, 1), // 水流方向
    // textureWidth: 1024, // 纹理宽度
    // textureHeight: 1024, // 纹理高度
    // // 水面的法线贴图。其作用是用于模拟水面波浪之间的交互以及光照效果，增加水面的真实感。
    // //   normalMap0: normalTexture, 
    // //   // 法线贴图是一种让表面产生凹凸感觉的纹理，用以增加真实感
    // //   normalMapUrl0: "./images/test.jpg",
    // //   // 这里也可以直接将贴图赋值给 normalMap0
    // //   envMap: cubeRenderTarget.texture, // 反射天空盒的立方体纹理
    // receiveShadow: true, // 是否接收阴影
    // distortionScale: 3.7, // 扭曲效果的大小
    // fog: scene.fog !== undefined // 是否启用雾效果 
    // };
    // const water = new THREE.Water(waterGeometry, waterOptions);
    // scene.add(water);
    var water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', function ( texture ) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            } ),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );
    
}

function createBubble(x, y, z) {
    
    // const joinLine = (arr) => arr.join("\n");
    // 
    // const sketchCreator = `
    //   const createSketch = () => {
    //     const sketch = new Sketch();
    //     sketch.create();
  
    //     sketch.record = () => {
    //       let capturer = new CCapture({
    //         format: "gif",
    //         workersPath: "../../vendors/",
    //       });
    //       let isRecording = false;
    //       window.addEventListener("keydown", (e) => {
    //         if (e.key === " ") {
    //           if (!isRecording) {
    //             capturer.start();
    //             isRecording = true;
    //           } else {
    //             capturer.stop();
    //             isRecording = false;
    //             capturer.save();
    //           }
    //         }
    //       });
  
    //       sketch.update(() => {
    //         if (isRecording) {
    //           if (sketch.composer){
    //             sketch.composer.render(sketch.scene, sketch.camera);
    //           } else {
    //             sketch.renderer.render(sketch.scene, sketch.camera);
    //           }
    //           capturer.capture(sketch.renderer.domElement);
    //         }
    //       });
    //     }
  
    //     sketch.record();
  
    //     return sketch;
    //   };
  
    //   const sketch = createSketch();
    //   `
    const vertexShader = `
        uniform float iTime;
        uniform vec2 iResolution;
        uniform vec2 iMouse;
        
        uniform float uDistortion;
        uniform float uRadius;
        uniform float uVelocity;
        varying vec2 vUv;
        //
        // Description : Array and textureless GLSL 2D/3D/4D simplex
        //               noise functions.
        //      Author : Ian McEwan, Ashima Arts.
        //  Maintainer : ijm
        //     Lastmod : 20110822 (ijm)
        //     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
        //               Distributed under the MIT License. See LICENSE file.
        //               https://github.com/ashima/webgl-noise
        //
        
        vec3 mod289(vec3 x){
            return x-floor(x*(1./289.))*289.;
        }
        
        vec4 mod289(vec4 x){
            return x-floor(x*(1./289.))*289.;
        }
        
        vec4 permute(vec4 x){
            return mod289(((x*34.)+1.)*x);
        }
        
        vec4 taylorInvSqrt(vec4 r)
        {
            return 1.79284291400159-.85373472095314*r;
        }
        
        float snoise(vec3 v)
        {
            const vec2 C=vec2(1./6.,1./3.);
            const vec4 D=vec4(0.,.5,1.,2.);
            
            // First corner
            vec3 i=floor(v+dot(v,C.yyy));
            vec3 x0=v-i+dot(i,C.xxx);
            
            // Other corners
            vec3 g=step(x0.yzx,x0.xyz);
            vec3 l=1.-g;
            vec3 i1=min(g.xyz,l.zxy);
            vec3 i2=max(g.xyz,l.zxy);
            
            //   x0 = x0 - 0.0 + 0.0 * C.xxx;
            //   x1 = x0 - i1  + 1.0 * C.xxx;
            //   x2 = x0 - i2  + 2.0 * C.xxx;
            //   x3 = x0 - 1.0 + 3.0 * C.xxx;
            vec3 x1=x0-i1+C.xxx;
            vec3 x2=x0-i2+C.yyy;// 2.0*C.x = 1/3 = C.y
            vec3 x3=x0-D.yyy;// -1.0+3.0*C.x = -0.5 = -D.y
            
            // Permutations
            i=mod289(i);
            vec4 p=permute(permute(permute(
                i.z+vec4(0.,i1.z,i2.z,1.))
                +i.y+vec4(0.,i1.y,i2.y,1.))
                +i.x+vec4(0.,i1.x,i2.x,1.));
            
            // Gradients: 7x7 points over a square, mapped onto an octahedron.
            // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
            float n_=.142857142857;// 1.0/7.0
            vec3 ns=n_*D.wyz-D.xzx;
            
            vec4 j=p-49.*floor(p*ns.z*ns.z);//  mod(p,7*7)
            
            vec4 x_=floor(j*ns.z);
            vec4 y_=floor(j-7.*x_);// mod(j,N)
            
            vec4 x=x_*ns.x+ns.yyyy;
            vec4 y=y_*ns.x+ns.yyyy;
            vec4 h=1.-abs(x)-abs(y);
            
            vec4 b0=vec4(x.xy,y.xy);
            vec4 b1=vec4(x.zw,y.zw);
            
            //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
            //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
            vec4 s0=floor(b0)*2.+1.;
            vec4 s1=floor(b1)*2.+1.;
            vec4 sh=-step(h,vec4(0.));
            
            vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
            vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
            
            vec3 p0=vec3(a0.xy,h.x);
            vec3 p1=vec3(a0.zw,h.y);
            vec3 p2=vec3(a1.xy,h.z);
            vec3 p3=vec3(a1.zw,h.w);
            
            //Normalise gradients
            vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
            p0*=norm.x;
            p1*=norm.y;
            p2*=norm.z;
            p3*=norm.w;
            
            // Mix final noise value
            vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
            m=m*m;
            return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),
            dot(p2,x2),dot(p3,x3)));
        }

        vec3 distort(vec3 p){
            float noise=snoise(vec3(p/2.+iTime*uVelocity));
            p*=(noise*pow(uDistortion,2.)+uRadius);
            return p;
        }
        
        void main(){
            vec3 p=position;
            
            vec3 dp=distort(p);
            
            csm_Position=dp;
            
            vUv=uv;
        }
    `
    const fragmentShader = `
        uniform float iTime;
        uniform vec2 iResolution;
        uniform vec2 iMouse;
        
        uniform vec3 uColor;
        varying vec2 vUv;
        void main(){
            vec2 p=vUv;
            
            vec3 col=uColor;
            
            csm_DiffuseColor=vec4(col,1.);
        }
    `;
    class Sketch extends kokomi.Base {
        create() {
            const envMap = new THREE.CubeTextureLoader().load([
                // "https://s2.loli.net/2022/09/29/GqseLg6tWoluDzV.png",
                "./images/bubble_texture.png",
                "./images/bubble_texture.png",
                "./images/bubble_texture.png",
                "./images/bubble_texture.png",
                "./images/bubble_texture.png",
                "./images/bubble_texture.png",
            ]);
            const bumpMap = new THREE.TextureLoader().load(
                "./images/bubble_bottom.jpg",
            );
            // bubble
            const cm = new kokomi.CustomMesh(this, {
            baseMaterial: new THREE.MeshPhysicalMaterial(),
            geometry: new THREE.IcosahedronGeometry(1, 4),
            vertexShader,
            fragmentShader,
            materialParams: {
                side: THREE.DoubleSide,
                roughness: 0,
                metalness: 1,
                clearcoat: 1,
                clearcoatRoughness: 1,
                bumpScale: 0.005,
                envMap,
                bumpMap,
            },
            uniforms: {
                uDistortion: {
                value: 0.4,
                },
                uRadius: {
                value: 1,
                },
                uVelocity: {
                value: 0.5,
                },
                uColor: {
                value: new THREE.Color("#ffffff"),
                },
            },
            });
            cm.addExisting();
            // bubbles
            const count = 64;
    
            const bubbles = [...Array(count).keys()].map(() => {
            const bubble = cm.mesh.clone();
            bubble.position.x = 4 * THREE.MathUtils.randFloat(-6, 6);
            bubble.position.y = 4 * THREE.MathUtils.randFloat(-5, 5);
            bubble.position.z = 4 * THREE.MathUtils.randFloat(-5, -1);
            const bubbleScale = THREE.MathUtils.randFloat(0, 1.5);
            bubble.scale.setScalar(bubbleScale);
            this.scene.add(bubble);
            return bubble;
            });
            // anime
            this.update(() => {
                const t = this.clock.elapsedTime;
                const mp = this.interactionManager.mouse;
    
                cm.mesh.rotation.z = t / 5;
                cm.mesh.rotation.x = THREE.MathUtils.lerp(
                cm.mesh.rotation.x,
                mp.y * Math.PI,
                0.1
                );
                cm.mesh.rotation.y = THREE.MathUtils.lerp(
                cm.mesh.rotation.y,
                mp.x * Math.PI,
                0.1
                );
                bubbles.forEach((bubble) => {
                bubble.position.y += THREE.MathUtils.randFloat(0.02, 0.06);
                if (bubble.position.y > 20) {
                    bubble.position.y = -20;
                }
                bubble.rotation.x += 0.04;
                bubble.rotation.y += 0.04;
                bubble.rotation.z += 0.02;
                });
            });
        }
    }
    const createSketch = () => {
        const sketch = new Sketch();
        sketch.create();
  
        sketch.record = () => {
          let capturer = new CCapture({
            format: "gif",
            workersPath: "../../vendors/",
          });
          let isRecording = false;
          window.addEventListener("keydown", (e) => {
            if (e.key === " ") {
              if (!isRecording) {
                capturer.start();
                isRecording = true;
              } else {
                capturer.stop();
                isRecording = false;
                capturer.save();
              }
            }
          });
  
          sketch.update(() => {
            if (isRecording) {
              if (sketch.composer){
                sketch.composer.render(sketch.scene, sketch.camera);
              } else {
                sketch.renderer.render(sketch.scene, sketch.camera);
              }
              capturer.capture(sketch.renderer.domElement);
            }
          });
        }
        sketch.record();
        return sketch;
      };
    const sketch = createSketch();
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

    stone1 = createStone(stoneRadius, stoneHeight, new THREE.MeshPhongMaterial({ color: 0x778899 }), ref_y - 350, stone2floor, -widthWall / 4 + 20, "曝气石1");
    stone2 = createStone(stoneRadius, stoneHeight, new THREE.MeshPhongMaterial({ color: 0x778899 }), ref_y - 240, stone2floor, -widthWall / 4 + 20, "曝气石2");
    stone3 = createStone(stoneRadius, stoneHeight, new THREE.MeshPhongMaterial({ color: 0x778899 }), ref_y - 160, stone2floor, -widthWall / 4 + 20, "曝气石3");
    stone4 = createStone(stoneRadius, stoneHeight, new THREE.MeshPhongMaterial({ color: 0x778899 }), ref_y - 50, stone2floor, -widthWall / 4 + 20, "曝气石4");
    stone5 = createStone(stoneRadius, stoneHeight, new THREE.MeshPhongMaterial({ color: 0x778899 }), ref_y - 350, stone2floor, widthWall / 4 - 20, "曝气石5");
    stone6 = createStone(stoneRadius, stoneHeight, new THREE.MeshPhongMaterial({ color: 0x778899 }), ref_y - 240, stone2floor, widthWall / 4 - 20, "曝气石6");
    stone7 = createStone(stoneRadius, stoneHeight, new THREE.MeshPhongMaterial({ color: 0x778899 }), ref_y - 160, stone2floor, widthWall / 4 - 20, "曝气石7");
    stone8 = createStone(stoneRadius, stoneHeight, new THREE.MeshPhongMaterial({ color: 0x778899 }), ref_y - 50, stone2floor, widthWall / 4 - 20, "曝气石8");

    // 创建气泡效果，首先以一个圆柱为例
    createBubble(1,2,3);

    // 创建桨叶及电线
    createFans(-distFan, heightWall - axisLengthFan1, -100, -distFan, heightWall - axisLengthFan2, 100);

    // 创建顶部管道
    createToptube();

    // 创建气泵
    createRefluxBump();

    // 创建传感器

    // 创建水
    // createWater();
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

    if (ssg1){
        stone1.material.color.set(0x55ff55);
        stone2.material.color.set(0x55ff55);
    }
    else{
        stone1.material.color.set(0x778899);
        stone2.material.color.set(0x778899);
    }
    if (ssg2){
        stone3.material.color.set(0x55ff55);
        stone4.material.color.set(0x55ff55);
    }
    else{
        stone3.material.color.set(0x778899);
        stone4.material.color.set(0x778899);
    }
    if (ssg3){
        stone5.material.color.set(0x55ff55);
        stone6.material.color.set(0x55ff55);
    }
    else{
        stone5.material.color.set(0x778899);
        stone6.material.color.set(0x778899);
    }
    if (ssg4){
        stone7.material.color.set(0x55ff55);
        stone8.material.color.set(0x55ff55);
    }
    else{
        stone7.material.color.set(0x778899);
        stone8.material.color.set(0x778899);
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
