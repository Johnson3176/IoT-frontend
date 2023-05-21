// 全局变量
var scene, camera, spotLight, stats, renderer, controls, fan1, fan2;
var vs, fs;

// 实物尺寸设置 （单位：mm)

/***** 定义参考点 *****/
var ref_x=0, ref_y = 0, ref_z = 0;


/***** 定义墙体 *****/
var lengthLeftWall = 700, lengthMiddleWall = 400, lengthRightWall = 150;
var heightWall = 600, widthWall = 400;
var thicknessOuter = 10, thicknessInner = 5; 
var heightDam = 450, distDam = 600;
var distFan = 500, distBioReactor = 500, distPartWall = 400, distLeftMiddle = 100;

var stoneRadius = 9, stoneHeight = 50;

var distFan1 = 250, distFan2 = 300;

var fan_base_v=0.5;


var p1;
var p2;
var p3;
var p4;
var p5;
var p6;

// 桨叶 底部曝气 精确曝气
var sf1=0;
var sf2=0;
var sb1=0;
var sb2=0;
var sb3=0;
var sb4=0;
var sb5=0;
var sb6=0;
var sf1=0;
var sf2=0;
var sb1=0;
var sb2=0;
var sb3=0;
var sb4=0;
var sb5=0;
var sb6=0;

