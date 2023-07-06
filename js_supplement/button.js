var is_on = false;
var IntervalTime = 1000;
var auto_control = 1;

function setScale() {
  let designWidth = 1440;
  let designHeight = 1024;
  let scale = document.documentElement.clientWidth / document.documentElement.clientHeight < designWidth / designHeight 
    ? document.documentElement.clientWidth / designWidth : document.documentElement.clientHeight / designHeight;
  document.querySelector("#screen").style.transform = `scale(${scale})`;
}

function sendMessage(msg){
  // 曝气控制信号发送
  $.ajax({
    url:'http://192.168.43.117:5000/'+msg,  //后台接口地址
    type:"get",  //get请求方式
    dataType:'json',
    async: true,
    // contentType:'application/json;charset=utf-8',
    // data:JSON.stringify(s_data),
    success:function(data){
      console.log('请求成功')
    },
    error:function(){}
  })
}

function recvMessage(ModeTime){
  let controlInterval;
  controlInterval = setInterval(function () {
    $.ajax({
      url: "http://192.168.196.178:5000/data", //后台请求的数据
      dataType: "json", // 预期返回的数据类型，如果是json格式，在接收到返回时会自动封装成json对象
      type: "get", // 请求方式
      async: true, // 是否异步请求
      success: function (data) {
        sf1 = data.LED0_STATE;
        sf2 = data.LED1_STATE;
        sb1 = data.LED2_STATE;
        sb2 = data.LED3_STATE;
        sb3 = data.LED4_STATE;
        sb4 = data.LED5_STATE;
        sb5 = data.LED6_STATE;
        sb6 = data.LED7_STATE;
      },
      error: function (arg1) {
        console.log('请求云数据失败');
      },
    });
  }, IntervalTime);
  if(controlInterval > ModeTime)
    clearInterval(controlInterval);
  // 点击曝气控制按钮后就会停止变化
  const button = document.getElementById("曝气控制");
  button.addEventListener("click",function(){clearInterval(controlInterval);});
  
}

function boilControl() {
  const button = document.getElementById("曝气控制");
  button.style.display='none';
  const button1 = document.getElementById("自动");
  const button2 = document.getElementById("手动");
  button1.style.display='inline-block';
  button2.style.display='inline-block';
  button1.addEventListener("click",selectMode);
  button2.addEventListener("click",selectMode);
}

function selectMode(obj){
  const targetElement = obj.target;
  const button1 = document.getElementById("自动");
  const button2 = document.getElementById("手动");
  button1.style.display='none';
  button2.style.display='none';
  if (targetElement.id=='自动'){
    const buttonMode1 = document.getElementById("模式1");
    const buttonMode2 = document.getElementById("模式2");
    const buttonMode3 = document.getElementById("模式3");
    buttonMode1.style.display='inline-block';
    buttonMode2.style.display='inline-block';
    buttonMode3.style.display='inline-block';
    buttonMode1.addEventListener("click",selectModeorDevice);
    buttonMode2.addEventListener("click",selectModeorDevice);
    buttonMode3.addEventListener("click",selectModeorDevice);
  }
  else {
    const buttonDevice1 = document.getElementById("桨叶1");
    const buttonDevice2 = document.getElementById("桨叶2");
    const buttonDevice3 = document.getElementById("气盘1");
    const buttonDevice4 = document.getElementById("气盘2");
    const buttonDevice5 = document.getElementById("气盘3");
    const buttonDevice6 = document.getElementById("气盘4");
    const buttonDevice7 = document.getElementById("气盘5");
    const buttonDevice8 = document.getElementById("气盘6");
    buttonDevice1.style.display='inline-block';
    buttonDevice2.style.display='inline-block';
    buttonDevice3.style.display='inline-block';
    buttonDevice4.style.display='inline-block';
    buttonDevice5.style.display='inline-block';
    buttonDevice6.style.display='inline-block';
    buttonDevice7.style.display='inline-block';
    buttonDevice8.style.display='inline-block';
    buttonDevice1.addEventListener("click",selectModeorDevice);
    buttonDevice2.addEventListener("click",selectModeorDevice);
    buttonDevice3.addEventListener("click",selectModeorDevice);
    buttonDevice4.addEventListener("click",selectModeorDevice);
    buttonDevice5.addEventListener("click",selectModeorDevice);
    buttonDevice6.addEventListener("click",selectModeorDevice);
    buttonDevice7.addEventListener("click",selectModeorDevice);
    buttonDevice8.addEventListener("click",selectModeorDevice);
  }
}

function selectModeorDevice(obj){
  const targetElement = obj.target;
  if(targetElement.id =='模式1' || targetElement.id =='模式2'|| targetElement.id =='模式3')
  {
    const buttonMode1 = document.getElementById("模式1");
    const buttonMode2 = document.getElementById("模式2");
    const buttonMode3 = document.getElementById("模式3");
    buttonMode1.style.display='none';
    buttonMode2.style.display='none';
    buttonMode3.style.display='none';
    const button = document.getElementById("曝气控制");
    button.style.display='inline-block';
    switch(targetElement.id)
    {
      case '模式1': 
        sendMessage(string_mode_data.mode1);
        recvMessage(38);
        break;
      case '模式2': 
        sendMessage(string_mode_data.mode2);
        recvMessage(50);
        break;
      case '模式3': 
        sendMessage(string_mode_data.mode3);
        recvMessage(60);
        break;
    }
  }
  else{
    current_device = targetElement.id;
    const buttonDevice1 = document.getElementById("桨叶1");
    const buttonDevice2 = document.getElementById("桨叶2");
    const buttonDevice3 = document.getElementById("气盘1");
    const buttonDevice4 = document.getElementById("气盘2");
    const buttonDevice5 = document.getElementById("气盘3");
    const buttonDevice6 = document.getElementById("气盘4");
    const buttonDevice7 = document.getElementById("气盘5");
    const buttonDevice8 = document.getElementById("气盘6");
    buttonDevice1.style.display='none';
    buttonDevice2.style.display='none';
    buttonDevice3.style.display='none';
    buttonDevice4.style.display='none';
    buttonDevice5.style.display='none';
    buttonDevice6.style.display='none';
    buttonDevice7.style.display='none';
    buttonDevice8.style.display='none';
    const buttonOn = document.getElementById("开启");
    const buttonOff = document.getElementById("关闭");
    buttonOn.style.display='inline-block';
    buttonOff.style.display='inline-block';
    buttonOn.addEventListener("click",selectOn);  // 注意这里应该填入句柄，否则是调用了该函数
    buttonOff.addEventListener("click",selectOn);
  }
}

function selectOn(obj){
  const targetElement = obj.target;
  const buttonOn = document.getElementById("开启");
  const buttonOff = document.getElementById("关闭");
  buttonOn.style.display='none';
  buttonOff.style.display='none';
  const button = document.getElementById("曝气控制");
  button.style.display='inline-block';
  switch (current_device)
  {
    case '桨叶1':
      if(targetElement.id=='开启'){
        sdata='ctrl_switch2/ON';
        sf1 = 1;
      }
      else{
        sdata='ctrl_switch2/OFF';
        sf1 = 0;
      }
      break;
    case '桨叶2':
      if(targetElement.id=='开启'){
        sdata='ctrl_switch3/ON';
        sf2 = 1;
      }
      else{
        sdata='ctrl_switch3/OFF';
        sf2 = 0;
      }
      break;
    
    case '气盘1':
      if(targetElement.id=='开启'){
        sdata='ctrl_motor0/2';
        sb1 = 1;
      }
      else{
        sdata='ctrl_motor0/0';
        sb1 = 0;
      }
      break;
    case '气盘2':
      if(targetElement.id=='开启'){
        sdata='ctrl_motor1/2';
        sb2 = 1;
      }
      else{
        sdata='ctrl_motor1/0';
        sb2 = 0;
      }
      break;
    case '气盘3':
      if(targetElement.id=='开启'){
        sdata='ctrl_motor2/2';
        sb3 = 1;
      }
      else{
        sdata='ctrl_motor2/0';
        sb3 = 0;
      }
      break;
    case '气盘4':
      if(targetElement.id=='开启'){
        sdata='ctrl_motor3/2';
        sb4 = 1;
      }
      else{
        sdata='ctrl_motor3/0';
        sb4 = 0;
      }
      break;
    case '气盘5':
      if(targetElement.id=='开启'){
        sdata='ctrl_motor4/2';
        sb5 = 1;
      }
      else{
        sdata='ctrl_motor4/0';
        sb5 = 0;
      }
      break;
    case '气盘6':
      if(targetElement.id=='开启'){
        sdata='ctrl_motor5/2';
        sb6 = 1;
      }
      else{
        sdata='ctrl_motor5/0';
        sb6 = 0;
      }
      break;
  }
  sendMessage(sdata);
}

function onlineDetection() {
  bton = document.getElementById("在线监测");
  if (!is_on) {
    bton.innerHTML = "暂停监测";
    is_on = true;
  } else {
    bton.innerHTML = "继续监测";
    is_on = false;
  }
}

window.onload = function () {
  setScale();
};
window.onresize = function () {
  setScale();
};

// 通过 jQuery，您可以选取（查询，query） HTML 元素，并对它们执行"操作"（actions）。
$(document).ready(function () {
  $.ajax({
    url: "http://192.168.43.117:5000/", //首先请求一次后台，再进行其他操作
    dataType: "json", // 预期返回的数据类型，如果是json格式，在接收到返回时会自动封装成json对象
    type: "get", // 请求方式
    async: true, // 是否异步请求
    success: function (data) {
    },
    error: function (arg1) {
    },
  });


  $(function () {
    let text = $("#fTbody:first");
    let status = $("#在线监测");
    // 请求数据完成时，更改temp的值，可以更新页面时，再将temp的值给页面
    let requestInterval; // 定义请求间隔句柄
    let updateInterval; // 定义需要清除动画的部分
    let tr_tmp1 = "<tr><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>";
    let tr_tmp2 = tr_tmp1,
      tr_tmp3 = tr_tmp1;

    // 添加鼠标悬停事件，悬停时页面数据暂时不会更新，但是悬停结束后会变成最新数据
    text
      .hover(
        // 参数为鼠标移入和移出的句柄函数
        function () {
          clearInterval(updateInterval);
        },
        function () {
          // 请求&页面更新数据，用两个计时器实现，鼠标移入只会暂停页面更新数据
          requestInterval = setInterval(function () {
            if (is_on)
              $.ajax({
                url: "http://192.168.43.183:5000/query", //后台请求的数据
                dataType: "json", // 预期返回的数据类型，如果是json格式，在接收到返回时会自动封装成json对象
                type: "get", // 请求方式
                async: true, // 是否异步请求
                success: function (data) {
                  let td;
                  td = "<td>" + data.time + "</td>";
                  td = "<td>" + data.temperature + "</td>";
                  td = "<td>" + data.DO + "</td>";
                  td = "<td>" + data.PH + "</td>";
                  td = "<td>" + data.TDS + "</td>";
                  tr_tmp1 = tr_tmp2;
                  tr_tmp2 = tr_tmp3;
                  tr_tmp3 = "<tr>" + td + "</tr>";
                },
                error: function (arg1) {
                  console.log(arg1);
                  alert("加载数据失败");
                },
              });
          }, IntervalTime);
          updateInterval = setInterval(function () {
            if (is_on) text.html(tr_tmp1 + tr_tmp2 + tr_tmp3);
          }, IntervalTime); // 滚动间隔时间
        }
      )
      .trigger("mouseleave");
  });
});
