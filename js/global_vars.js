// 全局变量
var scene, camera, spotLight, stats, renderer, controls, fan1, fan2;
var vs, fs;

// 实物尺寸设置 （单位：mm)

/***** 定义参考点 *****/
var ref_x=0, ref_y = 0, ref_z = 0;


/***** 墙体参数 *****/
var lengthLeftWall = 800, lengthMiddleWall = 400, lengthRightWall = 150;
var heightWall = 600, widthWall = 400;
var thicknessOuter = 10, thicknessInner = 5; 
var heightDam = 450, distDam = 700;
var distBioReactor = 600, distPartWall = 500, distLeftMiddle = 10;

/***** 曝气石参数 *****/
var stoneRadius = 9, stoneHeight = 50, stone2floor = 180;

/***** 风扇参数 *****/
var distFan = 600
var axisLengthFan1 = 250, axisLengthFan2 = 300;

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

