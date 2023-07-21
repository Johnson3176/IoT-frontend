/** 说明
 基于https://github.com/sshirokov/ThreeBSP修改的 这个版本太老了 很多api都不支持
 修改：目前适用于threeR140+  by李东琳
 必须在前面先引入 THREE 包
 import * as THREE from 'three'
 用法：
 创建球形几何体
 const sphereGeometry = new THREE.SphereGeometry(50, 20, 20)
 const sphere = this.createMesh(sphereGeometry)
 创建立方体几何体
 const cubeGeometry = new THREE.BoxGeometry(30, 30, 30)
 const cube = this.createMesh(cubeGeometry)
 cube.position.x = -50
 生成 ThreeBSP 对象
 const sphereBSP = new ThreeBSP(sphere)
 const cubeBSP = new ThreeBSP(cube)
 以下计算方式取其一即可
 进行差集计算（使用该函数可以在第一个几何体中移除两个几何体重叠的部分来创建新的几何体。）
 const resultBSP = sphereBSP.subtract(cubeBSP)
 进行并集计算（使用该函数可以将两个几何体联合起来创建出一个新的几何体。）
 const resultBSP = sphereBSP.union(cubeBSP)
 进行交集计算（使用该函数可以基于两个现有几何体的重合的部分定义此几何体的形状。）
 const resultBSP = sphereBSP.intersect(cubeBSP)
 从 BSP 对象内获取到处理完后的 mesh 模型数据
 const result = resultBSP.toMesh()
 更新模型的面和顶点的数据
 result.geometry.computeVertexNormals()
 重新赋值一个纹理
 const material = new THREE.MeshPhongMaterial({ color: 0x00ffff })
 result.material = material
 将计算出来模型添加到场景当中
 this.scene.add(result)
 **/
 
 import * as THREE from 'three'
 // 表示最大的偏差量，如果偏差小于此值，则忽略偏差
 const EPSILON = 1e-5;
  
 // 共面
 const COPLANAR = 0;
  
 // 在前方
 const FRONT = 1;
  
 // 在后方
 const BACK = 2;
  
 // 存在交集
 const SPANNING = 3;
  
 var __slice = [].slice,
     __hasProp = {}.hasOwnProperty,
     __extends = function (child, parent) {
         for (var key in parent) {
             if (__hasProp.call(parent, key)) child[key] = parent[key];
         }
  
         function ctor() {
             this.constructor = child;
         }
  
         ctor.prototype = parent.prototype;
         child.prototype = new ctor();
         child.__super__ = parent.prototype;
         return child;
     };
 const ThreeBSP = (function() {
  
     function ThreeBSP(treeIsh, matrix) {
         this.matrix = matrix;
         if (this.matrix == null) {
             this.matrix = new THREE.Matrix4();
         }
         this.tree = this.toTree(treeIsh);
     }
  
     ThreeBSP.prototype.toTree = function (treeIsh) {
         if (treeIsh instanceof ThreeBSP.Node) {
             return treeIsh;
         }
         // 看Three.js 0.142源码，各类Geometry基本都是继承或由BufferGeometry实现，基本上THREE.Geometry就废弃了，所以需要将获取点、法向量、uv信息要从以前的THREE.Geometry的faces中获取改为从THREE.BufferGeometry的attributes中获取
         var polygons = [],
             geometry = (treeIsh === THREE.BufferGeometry || (treeIsh.type || "").endsWith("Geometry")) ? treeIsh : treeIsh.constructor === THREE.Mesh ? (treeIsh.updateMatrix(), this.matrix = treeIsh.matrix.clone(), treeIsh.geometry) : void 0;
         if (geometry && geometry.attributes) {
             // todo 暂时就不对geometry.attributes中的position、 normal和uv进行非空验证了，日后有时间在说吧，正常创建的BufferGeometry这些值通常都是有的
             var attributes = geometry.attributes, normal = attributes.normal, position = attributes.position,
                 uv = attributes.uv;
             // 点的数量
             var pointsLength = attributes.position.array.length / attributes.position.itemSize;
  
             // 如果索引三角形index不为空，则根据index获取面的顶点、法向量、uv信息
             if (geometry.index) {
                 var pointsArr = [], normalsArr = [], uvsArr = [];
                 // 从geometry的attributes读取点、法向量、uv数据
                 for (var i = 0, len = pointsLength; i < len; i++) {
                     // 通常一个点和一个法向量的数据量（itemSize）是3，一个uv的数据量（itemSize）是2
                     var startIndex = 3 * i
                     pointsArr.push(new THREE.Vector3(position.array[startIndex], position.array[startIndex + 1], position.array[startIndex + 2]));
                     normalsArr.push(new THREE.Vector3(normal.array[startIndex], normal.array[startIndex + 1], normal.array[startIndex + 2]));
                     uvsArr.push(new THREE.Vector2(uv.array[2 * i], uv.array[2 * i + 1]));
                 }
                 var index = geometry.index.array;
                 for (let i = 0, len = index.length; i < len;) {
                     var polygon = new ThreeBSP.Polygon();
                     // 将所有面都按照三角面进行处理，即三个顶点组成一个面
                     for (var j = 0; j < 3; j++) {
                         var pointIndex = index[i], point = pointsArr[pointIndex];
                         var vertex = new ThreeBSP.Vertex(point.x, point.y, point.z, normalsArr[pointIndex], uvsArr[pointIndex]);
                         vertex.applyMatrix4(this.matrix);
                         polygon.vertices.push(vertex);
                         i++;
                     }
                     polygons.push(polygon.calculateProperties());
                 }
             } else {
                 // 如果索引三角形index为空，则假定每三个相邻位置（即相邻的三个点）表示一个三角形
                 for (let i = 0, len = pointsLength; i < len;) {
                     let polygon = new ThreeBSP.Polygon();
                     // 将所有面都按照三角面进行处理，即三个顶点组成一个面
                     for (let j = 0; j < 3; j++) {
                         let startIndex = 3 * i
                         let vertex = new ThreeBSP.Vertex(position.array[startIndex], position.array[startIndex + 1], position.array[startIndex + 2], new THREE.Vector3(normal.array[startIndex], normal.array[startIndex + 1], normal.array[startIndex + 2]), new THREE.Vector2(uv.array[2 * i], uv.array[2 * i + 1]));
                         vertex.applyMatrix4(this.matrix);
                         polygon.vertices.push(vertex);
                         i++;
                     }
                     polygons.push(polygon.calculateProperties());
                 }
             }
         } else {
             console.error("初始化ThreeBSP时为获取到几何数据信息，请检查初始化参数");
         }
         return new ThreeBSP.Node(polygons);
     };
  
     /**
      * 转换成mesh
      * @param {*} material 材质
      * @param {Boolean} groupByCoplanar 是否根据共面进行分组
      * @param {Boolean} uniqueMaterial 每个分组使用唯一的材质（此处将材质索引和组索引设置为一样的）
      * @returns
      */
     ThreeBSP.prototype.toMesh = function (material, groupByCoplanar, uniqueMaterial) {
         var geometry = this.toGeometry(groupByCoplanar, uniqueMaterial);
         if (material == null) {
             material = new THREE.MeshNormalMaterial();
         }
         var mesh = new THREE.Mesh(geometry, material);
         // mesh.position.getPositionFromMatrix(this.matrix);//弃用api
         mesh.position.setFromMatrixPosition(this.matrix);
         mesh.rotation.setFromRotationMatrix(this.matrix);
         return mesh;
     };
  
     /**
      * 转换成图形
      * @param {Boolean} groupByCoplanar 是否根据共面进行分组
      * @param {Boolean} uniqueMaterial 每个分组使用唯一的材质（此处将材质索引和组索引设置为一样的）
      * @returns
      */
     ThreeBSP.prototype.toGeometry = function (groupByCoplanar, uniqueMaterial) {
         var geometry = new THREE.BufferGeometry();
         //Matrix4 没有getInverse方法 改成
         //var matrix = new THREE.Matrix4().getInverse(this.matrix);
         var matrix = this.matrix.invert();
         // verticesArr用于记录点（去重），index依次记录面中各个点对应的索引
         var position = [], normal = [], uv = [], verticesArr = [], index = [];
         var resolvePolygon = (polygon) => {
             polygon.vertices.forEach(item => {
                 var vertice = item.clone().applyMatrix4(matrix), verticeIndex = null;
                 for (var i = 0, len = verticesArr.length; i < len; i++) {
                     if (vertice.equals(verticesArr[i])) {
                         verticeIndex = i;
                         break;
                     }
                 }
                 // verticeIndex为空，表示数组中未记录当前点，进行点数据处理
                 if (verticeIndex == null) {
                     verticeIndex = verticesArr.length;
                     verticesArr.push(vertice);
                     position.push(vertice.x);
                     position.push(vertice.y);
                     position.push(vertice.z);
                     normal.push(vertice.normal.x);
                     normal.push(vertice.normal.y);
                     normal.push(vertice.normal.z);
                     uv.push(vertice.uv.x);
                     uv.push(vertice.uv.y);
                 }
                 // 存储点的索引
                 index.push(verticeIndex);
             })
         };
         if (groupByCoplanar) {
             // 将共面的面分到相同的组中
             var polygonGroups = [], groups = [];
             this.tree.allPolygons().forEach(polygon => {
                 // 归入分组标志
                 var flag = false;
                 for (var i = 0, len = polygonGroups.length; i < len; i++) {
                     if (COPLANAR === polygon.classifySide(polygonGroups[i][0])) {
                         polygonGroups[i].push(polygon);
                         flag = true;
                         break;
                     }
                 }
                 if (!flag) {
                     // 为归入到已有分组中，建立新的分组
                     polygonGroups.push([polygon]);
                 }
             });
             // 按照共面组进行数据的处理
             var start = 0;
             for (var i = 0, len = polygonGroups.length; i < len; i++) {
                 var polygonGroup = polygonGroups[i], count = polygonGroup.length * 3, groupItem = {
                     start: start,
                     count: count
                 };
                 if (uniqueMaterial) {
                     groupItem.materialIndex = i;
                 }
                 polygonGroup.forEach(resolvePolygon);
                 groups.push(groupItem);
                 start = start + count;
             }
             geometry.groups = groups;
         } else {
             this.tree.allPolygons().forEach(resolvePolygon);
         }
  
         geometry.setAttribute('position', new THREE.BufferAttribute(Float32Array.from(position), 3, false));
         geometry.setAttribute('normal', new THREE.BufferAttribute(Float32Array.from(normal), 3, false));
         geometry.setAttribute('uv', new THREE.BufferAttribute(Float32Array.from(uv), 2, false));
         geometry.index = new THREE.Uint16BufferAttribute(new Uint16Array(index), 1, false);
         return geometry;
     };
  
     /**
      * 差集
      * @param {*} other
      * @returns
      */
     ThreeBSP.prototype.subtract = function (other) {
         var us = this.tree.clone(), them = other.tree.clone();
         us.invert().clipTo(them);
         them.clipTo(us).invert().clipTo(us).invert();
         return new ThreeBSP(us.build(them.allPolygons()).invert(), this.matrix);
     };
  
     /**
      * 并集
      * @param {*} other
      * @returns
      */
     ThreeBSP.prototype.union = function (other) {
         var us = this.tree.clone(), them = other.tree.clone();
         us.clipTo(them);
         them.clipTo(us).invert().clipTo(us).invert();
         return new ThreeBSP(us.build(them.allPolygons()), this.matrix);
     };
  
     /**
      * 交集
      * @param {*} other
      * @returns
      */
     ThreeBSP.prototype.intersect = function (other) {
         var us = this.tree.clone(), them = other.tree.clone();
         them.clipTo(us.invert()).invert().clipTo(us.clipTo(them));
         return new ThreeBSP(us.build(them.allPolygons()).invert(), this.matrix);
     };
     return ThreeBSP;
 })();
  
 ThreeBSP.Vertex = (function (_super) {
     __extends(Vertex, _super);
  
     function Vertex(x, y, z, normal, uv) {
         this.x = x;
         this.y = y;
         this.z = z;
         this.normal = normal != null ? normal : new THREE.Vector3();
         this.uv = uv != null ? uv : new THREE.Vector2();
         // 此方法调用父级THREE.Vector3构造函数会报错TypeError: Class constructor Vector3 cannot be invoked without 'new'，因此弃用此方式，改为显示初始化x,y,z
         // Vertex.__super__.constructor.call(this, x, y, z);
     }
  
     /**
      * 克隆点
      * @returns
      */
     Vertex.prototype.clone = function () {
         return new ThreeBSP.Vertex(this.x, this.y, this.z, this.normal.clone(), this.uv.clone());
     };
  
     /**
      * 插点函数
      * @param {*} v
      * @param {*} alpha
      * @returns
      */
     Vertex.prototype.lerp = function (v, alpha) {
         // 对uv进行插值
         this.uv.add(v.uv.clone().sub(this.uv).multiplyScalar(alpha));
         // 对法向量进行插值
         this.normal.lerp(v, alpha);
         // 调用THREE.Vector3的lerp方法对点进行插值
         return Vertex.__super__.lerp.apply(this, arguments);
     };
  
     /**
      * 在两个点之间插入新的点
      * @returns
      */
     Vertex.prototype.interpolate = function () {
         var args = 1 <= arguments.length ? __slice.call(arguments, 0) : [], cloneVertex = this.clone();
         return cloneVertex.lerp.apply(cloneVertex, args);
     };
  
     /**
      * 判断两个点是否相同
      * @returns
      */
     Vertex.prototype.equals = function (vertex) {
         if (vertex) {
             if (this.x === vertex.x && this.y === vertex.y && this.z === vertex.z) {
                 var checkUv = function (uv1, uv2) {
                     if (uv1 && uv2 && uv1.x === uv2.x && uv1.y === uv2.y) {
                         return true;
                     } else if (!uv1 && !uv2) {
                         return true;
                     }
                     return false;
                 }
                 if (this.normal && vertex.normal && this.normal.x === vertex.normal.x && this.normal.y === vertex.normal.y && this.normal.z === vertex.normal.z) {
                     return checkUv(this.uv, vertex.uv);
                 }
                 if (!this.normal && !vertex.normal) {
                     return checkUv(this.uv, vertex.uv);
                 }
             }
         }
         return false;
     };
  
     return Vertex;
  
 })(THREE.Vector3);
  
 /**
  * 多边形（或者成为网格），目前默认只有三角形
  */
 ThreeBSP.Polygon = (function () {
     function Polygon(vertices, normal, w) {
         this.vertices = vertices != null ? vertices : [];
         // 网格面的法向量
         this.normal = normal;
         this.w = w;
         if (this.vertices.length) {
             this.calculateProperties();
         }
     }
  
     /**
      * 计算面的一些属性
      * @returns
      */
     Polygon.prototype.calculateProperties = function () {
         var a = this.vertices[0], b = this.vertices[1], c = this.vertices[2];
         // 计算面的法向量
         this.normal = b.clone().sub(a).cross(c.clone().sub(a)).normalize();
         this.w = this.normal.clone().dot(a);
         return this;
     };
  
     /**
      * 克隆网格面
      * @returns
      */
     Polygon.prototype.clone = function () {
         return new ThreeBSP.Polygon(this.vertices.map(v => v.clone()), this.normal.clone(), this.w);
     };
  
     /**
      * 对网格面进行翻转倒置
      * @returns
      */
     Polygon.prototype.invert = function () {
         this.normal.multiplyScalar(-1);
         this.w *= -1;
         this.vertices.reverse();
         return this;
     };
  
     /**
      * 判断点与当前网格面的关系
      * @param {*} vertex
      * @returns
      */
     Polygon.prototype.classifyVertex = function (vertex) {
         var side = this.normal.dot(vertex) - this.w;
         switch (false) {
             case !(side < -EPSILON):
                 return BACK;
             case !(side > EPSILON):
                 return FRONT;
             default:
                 // 共面
                 return COPLANAR;
         }
     };
  
     /**
      * 判断指定网格面polygon与当前网格面的关系（FRONT：在当前面的前方， BACK：在当前面的后方， COPLANAR：与当前面共面， SPANNING：两个面交叉）
      * @param {*} polygon
      * @returns
      */
     Polygon.prototype.classifySide = function (polygon) {
         var back = 0, front = 0;
         polygon.vertices.forEach(vertice => {
             switch (this.classifyVertex(vertice)) {
                 case FRONT:
                     front += 1;
                     break;
                 case BACK:
                     back += 1;
                     break;
             }
         })
  
         if (front > 0 && back === 0) {
             return FRONT;
         }
         if (front === 0 && back > 0) {
             return BACK;
         }
         if ((front === back && back === 0)) {
             // 共面
             return COPLANAR;
         }
         return SPANNING;
     };
  
     /**
      * 对两个网格面进行嵌合
      * @param {*} poly
      * @returns
      */
     Polygon.prototype.tessellate = function (poly) {
         // 如果两个面是平行的或者时共面，则直接返回无需处理
         if (this.classifySide(poly) !== SPANNING) {
             return [poly];
         }
         // 如果两个面是相交面，则进行插值处理
         let frontVertices = [], backVertices = [], count = poly.vertices.length, t, ti, tj, v, vi, vj;
         for (let i = 0, _len = poly.vertices.length; i < _len; i++) {
             vi = poly.vertices[i];
             vj = poly.vertices[((i + 1) % count)];
             ti = this.classifyVertex(vi),
                 tj = this.classifyVertex(vj);
             if (ti !== BACK) {
                 frontVertices.push(vi);
             }
             if (ti !== FRONT) {
                 backVertices.push(vi);
             }
             if ((ti | tj) === SPANNING) {
                 t = (this.w - this.normal.dot(vi)) / this.normal.dot(vj.clone().sub(vi));
                 v = vi.interpolate(vj, t);
                 frontVertices.push(v);
                 backVertices.push(v);
             }
         }
         var polys = [], frontLength = frontVertices.length, backLength = backVertices.length;
         if (frontLength >= 3) {
             polys.push(new ThreeBSP.Polygon(frontVertices.slice(0, 3)));
             // 将多边形切割成多个三角面
             if (frontLength > 3) {
                 var newVertices;
                 for (var start = 2; start < frontLength; start++) {
                     newVertices = [frontVertices[start], frontVertices[(start + 1) % frontLength], frontVertices[(start + 2) % frontLength]]
                     polys.push(new ThreeBSP.Polygon(newVertices));
                 }
             }
         }
         if (backLength >= 3) {
             polys.push(new ThreeBSP.Polygon(backVertices.slice(0, 3)));
             // 将多边形切割成多个三角面
             if (backLength > 3) {
                 let newVertices;
                 for (let start = 2; start < backLength - 1; start++) {
                     newVertices = [backVertices[start], backVertices[(start + 1) % backLength], backVertices[(start + 2) % backLength]]
                     polys.push(new ThreeBSP.Polygon(newVertices));
                 }
             }
         }
         return polys;
     };
  
     /**
      * 将指定面的点对于当前面的关系进行细分
      * @param {*} polygon
      * @param {*} coplanar_front
      * @param {*} coplanar_back
      * @param {*} front
      * @param {*} back
      * @returns
      */
     Polygon.prototype.subdivide = function (polygon, coplanar_front, coplanar_back, front, back) {
         var poly, side, _ref = this.tessellate(polygon), _results = [];
         for (var _i = 0, _len = _ref.length; _i < _len; _i++) {
             poly = _ref[_i];
             side = this.classifySide(poly);
             switch (side) {
                 case FRONT:
                     _results.push(front.push(poly));
                     break;
                 case BACK:
                     _results.push(back.push(poly));
                     break;
                 case COPLANAR:
                     if (this.normal.dot(poly.normal) > 0) {
                         _results.push(coplanar_front.push(poly));
                     } else {
                         _results.push(coplanar_back.push(poly));
                     }
                     break;
                 default:
                     throw new Error("BUG: Polygon of classification " + side + " in subdivision");
             }
         }
         return _results;
     };
  
     return Polygon;
 })();
  
 ThreeBSP.Node = (function () {
  
     function Node(polygons) {
         this.polygons = [];
         if (polygons != null && polygons.length) {
             this.build(polygons);
         }
     }
  
     /**
      *
      * @returns 克隆Node
      */
     Node.prototype.clone = function () {
         var node = new ThreeBSP.Node();
         node.divider = this.divider != null ? this.divider.clone() : void 0;
         node.polygons = this.polygons.map(item => item.clone());
         node.front = this.front != null ? this.front.clone() : void 0;
         node.back = this.back != null ? this.back.clone() : void 0;
         return node;
     };
  
     /**
      * 根据面构建Node
      * @param {*} polygons
      * @returns
      */
     Node.prototype.build = function (polygons) {
         var polys, sides = {
             front: [],
             back: []
         };
         if (this.divider == null) {
             this.divider = polygons[0].clone();
         }
         for (var _i = 0, _len = polygons.length; _i < _len; _i++) {
             this.divider.subdivide(polygons[_i], this.polygons, this.polygons, sides.front, sides.back);
         }
         for (var side in sides) {
             if (!__hasProp.call(sides, side)) continue;
             polys = sides[side];
             if (polys.length) {
                 if (this[side] == null) {
                     this[side] = new ThreeBSP.Node();
                 }
                 this[side].build(polys)
             }
         }
         return this;
     };
  
     /**
      * 判断是否是凸面的
      * @param {*} polys
      * @returns
      */
     Node.prototype.isConvex = function (polys) {
         var inner, outer;
         for (var _i = 0, _len = polys.length; _i < _len; _i++) {
             inner = polys[_i];
             for (var _j = 0, _len1 = polys.length; _j < _len1; _j++) {
                 outer = polys[_j];
                 if (inner !== outer && outer.classifySide(inner) !== BACK) {
                     return false;
                 }
             }
         }
         return true;
     };
  
     /**
      * 获取Node的所有网格面
      * @returns
      */
     Node.prototype.allPolygons = function () {
         return this.polygons.slice().concat(this.front != null ? this.front.allPolygons() : []).concat(this.back != null ? this.back.allPolygons() : []);
     };
  
     /**
      * 将Node进行倒置反转
      * @returns
      */
     Node.prototype.invert = function () {
         // 反转网格
         this.polygons.forEach(item => item.invert());
  
         [this.divider, this.front, this.back].forEach(item => {
             if (item != null) {
                 item.invert();
             }
         });
  
         var _ref2 = [this.back, this.front];
         this.front = _ref2[0];
         this.back = _ref2[1]
         return this;
     };
  
     /**
      * 剪裁多边形
      * @param {*} polygons
      * @returns
      */
     Node.prototype.clipPolygons = function (polygons) {
         var back = [], front = [];
         if (!this.divider) {
             return polygons.slice();
         }
         polygons.forEach(poly => this.divider.subdivide(poly, front, back, front, back))
         if (this.front) {
             front = this.front.clipPolygons(front);
         }
         if (this.back) {
             back = this.back.clipPolygons(back);
         }
         return front.concat(this.back ? back : []);
     };
  
     /**
      * 用指定node对当前node进行剪裁
      * @param {*} node
      * @returns
      */
     Node.prototype.clipTo = function (node) {
         this.polygons = node.clipPolygons(this.polygons);
         if (this.front != null) {
             this.front.clipTo(node);
         }
         if (this.back != null) {
             this.back.clipTo(node);
         }
  
         return this;
     };
  
     return Node;
 })();
  
 export {
     ThreeBSP
 }