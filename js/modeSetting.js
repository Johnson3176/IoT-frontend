function timingMode() {
  // 0-1 桨叶  2-5 曝气石组  6-8 回流泵  9-14 纳米气盘
  // 24小时映射至60s，由早晨八点开始
  /* 定时模式控制流程 */
  /* 
    8-10s 低功率 10-15 中功率 15-17 高功率 17-23 中功率 23-3 高功率 3-4 中功率 4-8 低功率
    
    0-5 低功率 桨叶开启，纳米气盘5档 TTFFFFFFF555555
    5-17.5 中功率 曝气石开启 纳米气盘关闭 FFTTTTFFF000000
    17.5-22.5 高功率 曝气石开启 纳米气盘开启8档 FFTTTTFFF888888
    22.5-37.5 中功率 桨叶开启 曝气石开启 纳米气盘关闭 回流泵开启 TTTTTTTTT000000
    37.5-47.5 高功率 桨叶关闭 曝气石开启 纳米气盘开启10档 回流泵开启 FFTTTTFFFAAAAAA
    47.5-50 中功率 回流泵开启 纳米气盘7档 FFFFFFTTT777777
    50-60 低功率 桨叶开启 纳米气盘4档 TTFFFFFFF444444
  */
  setTimeout(function(){
    controlReset();
    sf1=1;
    sf2=1;
    sdata = 'TTFFFFFFF555555';
    sendMessage();
  },0);
  setTimeout(function(){
    sf1=0;
    sf2=0;
    ssg1=1;
    ssg2=1;
    ssg3=1;
    ssg4=1;
    sdata = 'FFTTTTFFF000000';
    sendMessage();
  },5000*3);
  setTimeout(function(){
    sdata = 'FFTTTTFFF888888';
    sendMessage();
  },17500*3);
  setTimeout(function(){
    sf1=1;
    sf2=1;
    sp1=1;
    sp2=1;
    sp3=1;
    sdata = 'TTTTTTTTT000000';
    sendMessage();
  },22500*3);
  setTimeout(function(){
    sf1=0;
    sf2=0;
    ssg1=1;
    ssg2=1;
    ssg3=1;
    ssg4=1;
    sdata = 'FFTTTTFFFAAAAAA';
    sendMessage();
  },37500*3);
  setTimeout(function(){
    ssg1=0;
    ssg2=0;
    ssg3=0;
    ssg4=0;
    sp1=1;
    sp2=1;
    sp3=1;
    sdata = 'FFFFFFTTT777777';
    sendMessage();
  },47500*3);
  setTimeout(function(){
    sf1=1;
    sf2=1;
    sp1=0;
    sp2=0;
    sp3=0;
    sdata = 'TTFFFFFFF444444';
    sendMessage();
  },50000*3);
  setTimeout(function(){
    // 最终一切状态归零
    controlReset();
    $("#mode2").removeClass("active");
  },60000*3);
}

function intelligentMode(){
  $("#mode3").removeClass("active");
}