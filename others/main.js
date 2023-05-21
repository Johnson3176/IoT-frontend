import * as THREE from "three";
// 建立场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8cc7de);
// 建立相机对象，设置视场角FOV、长宽比、？？、相机位置、相机朝向
// 建立透视相机
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 500 );
camera.position.set( 0, 0, 10 );
camera.lookAt(0, 0, 0 );

// 建立正交相机
// const camera = new THREE.OrthographicCamera(-50,50,-50,50,-20,20);
// camera.position.set(0,0,0);

// 建立渲染对象，渲染占页面大小
// javascript中获取div元素
const div_mid = document.getElementById("div_mid")
const renderer = new THREE.WebGLRenderer();
renderer.setSize(div_mid.clientWidth, div_mid.clientHeight);
renderer.shadowMap.enabled = true;
div_mid.appendChild(renderer.domElement);


// 建立坐标轴
var axes = new THREE.AxesHelper(10);
// axes.setColors(0x00ffff,0xff0000,0x00ff00)
scene.add(axes);

// 建立方块几何对象
const geometry1 = new THREE.BoxGeometry( 1, 1, 1 );
const material1 = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry1, material1 );
cube.castShadow = true;

const material2 = new THREE.LineBasicMaterial( { color: 0x0000ff } );
const points = [];
points.push( new THREE.Vector3( - 10, 0, 0 ) );
points.push( new THREE.Vector3( 0, 10, 0 ) );
points.push( new THREE.Vector3( 10, 0, 0 ) );

// 建立线几何对象
// const geometry2 = new THREE.BufferGeometry().setFromPoints( points );
// const line = new THREE.Line( geometry2, material2 );

// 建立地面几何对象
// var planeGeometry = new THREE.PlaneGeometry(100,100);
// 建立Lambert材质接收阴影

// var planeMaterial = new THREE.MeshBasicMaterial({color: 0x222222});
// var planeMaterial = new THREE.MeshLambertMaterial({color:0xcccccc});
// var planeMesh = new THREE.Mesh(planeGeometry,planeMaterial);
// planeMesh.rotation.x = - Math.PI / 2;
// planeMesh.position.set(15, 0, 0);
// planeMesh.recieveShadow = true;
// var planeGeometry = new THREE.PlaneGeometry(10, 10);
// var material = new THREE.MeshBasicMaterial({ color: 0x888888 });
// var planeMesh = new THREE.Mesh(planeGeometry, material);
var ambienLight = new THREE.AmbientLight(0xAAAAAA);
scene.add(ambienLight);

// scene.add(planeMesh);


// 设置光源
var spotLight = new THREE.SpotLight(0xFFFFFF);
spotLight.position.set(0,40,0);
spotLight.castShadow = true;
spotLight.shadow.mapSize = new THREE.Vector2(1024,1024);
spotLight.shadow.camera.far = 130;
spotLight.shadow.camera.near = 40;
scene.add(spotLight);


// plane.rotation.x

// scene.add(plane);
scene.add( cube );
// scene.add( line );
function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    // 渲染
    renderer.render( scene, camera );
}
// 相当于一个循环函数，在用户打开其他界面时不会占用资源
animate();