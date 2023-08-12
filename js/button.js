var is_on = false;
var IntervalTime = 3000;
var auto_control = 1;


function setScale() {
  let designWidth = 1440;
  let designHeight = 1024;
  let scale =
    document.documentElement.clientWidth /
      document.documentElement.clientHeight <
    designWidth / designHeight
      ? document.documentElement.clientWidth / designWidth
      : document.documentElement.clientHeight / designHeight;
  // document.querySelector("#screen").style.transform = `scale(${scale})`;
}

function replacepos(text,start,stop,replacetext){
  mystr = text.substring(0,start)+replacetext+text.substring(stop+1);
  return mystr;
}

function sendMessage() {
  // js推出了原生方法补零

  // let myDate = new Date();
  // let year = myDate.getFullYear().toString().padStart(4, "0");
  // let month = (myDate.getMonth() + 1).toString().padStart(2, "0");
  // let date = myDate.getDate().toString().padStart(2, "0");
  // let hour = myDate.getHours().toString().padStart(2, "0");
  // let minute = myDate.getMinutes().toString().padStart(2, "0");
  // let second = myDate.getSeconds().toString().padStart(2, "0");
  // let millisecond = myDate.getMilliseconds().toString().padStart(4, "0");
  // let partition = "00";
  // let time =
  //   year + month + date + hour + minute + second + millisecond + partition;
  // let msg = time + sdata;
  // console.log(msg);
  msg = '12345678901234567890'+sdata;
  console.log(msg);
  // 曝气控制信号发送
  $.ajax({
    url: baseUrl + "AllControl", // 后台接口地址
    type: "post", // post请求方式
    dataType: "json",
    async: true,
    contentType: "application/json;charset=utf-8",
    data: JSON.stringify(msg), // post方式提交的数据
    success: function (data) {
      console.log("控制指令发送成功!");
    },
    error: function () {
      console.log(url + "地址请求超时!");
    },
  });
}

// function recvMessage(ModeTime){
//   let controlInterval;
//   controlInterval = setInterval(function () {
//     $.ajax({
//       url: baseUrl+"data", //后台请求的数据
//       dataType: "json", // 预期返回的数据类型，如果是json格式，在接收到返回时会自动封装成json对象
//       type: "get", // 请求方式
//       async: true, // 是否异步请求
//       success: function (data) {
//         sf1 = data.LED0_STATE;
//         sf2 = data.LED1_STATE;
//         sb1 = data.LED2_STATE;
//         sb2 = data.LED3_STATE;
//         sb3 = data.LED4_STATE;
//         sb4 = data.LED5_STATE;
//         sb5 = data.LED6_STATE;
//         sb6 = data.LED7_STATE;
//       },
//       error: function (arg1) {
//         console.log('请求云数据失败');
//       },
//     });
//   }, IntervalTime);
//   if(controlInterval > ModeTime)
//     clearInterval(controlInterval);
//   // 点击曝气控制按钮后就会停止变化
//   const button = document.getElementById("曝气控制");
//   button.addEventListener("click",function(){clearInterval(controlInterval);});

// }

function gpioControlFan1() {
  const button = document.getElementById("桨叶1");
  if (sf1 == 0) {
    button.style.backgroundColor = "#FF0000";
    sf1 = 1;
    sdata=replacepos(sdata,0,0,'T');
    sendMessage();
  } else {
    button.style.backgroundColor = "#EEE";
    sf1 = 0;
    sdata=replacepos(sdata,0,0,'F');
    sendMessage();
  }
}

function gpioControlFan2() {
  const button = document.getElementById("桨叶2");
  if (sf2 == 0) {
    button.style.backgroundColor = "#FF0000";
    sf2 = 1;
    sdata=replacepos(sdata,1,1,'T');
    sendMessage();
  } else {
    button.style.backgroundColor = "#EEE";
    sf2 = 0;
    sdata=replacepos(sdata,1,1,'F');
    sendMessage();
  }
}

function gpioControlStoneGroup1() {
  const button = document.getElementById("曝气石组1");
  if (ssg1 == 0) {
    button.style.backgroundColor = "#FF0000";
    ssg1 = 1;
    sdata=replacepos(sdata,2,2,'T');
    sendMessage();
  } else {
    button.style.backgroundColor = "#EEE";
    ssg1 = 0;
    sdata=replacepos(sdata,2,2,'F');
    sendMessage();
  }
}

function gpioControlStoneGroup2() {
  const button = document.getElementById("曝气石组2");
  if (ssg2 == 0) {
    button.style.backgroundColor = "#FF0000";
    ssg2 = 1;
    sdata=replacepos(sdata,3,3,'T');
    sendMessage();
  } else {
    button.style.backgroundColor = "#EEE";
    ssg2 = 0;
    sdata=replacepos(sdata,3,3,'F');
    sendMessage();
  }
}

function gpioControlStoneGroup3() {
  const button = document.getElementById("曝气石组3");
  if (ssg3 == 0) {
    button.style.backgroundColor = "#FF0000";
    ssg3 = 1;
    sdata=replacepos(sdata,4,4,'T');
    sendMessage();
  } else {
    button.style.backgroundColor = "#EEE";
    ssg3 = 0;
    sdata=replacepos(sdata,4,4,'F');
    sendMessage();
  }
}

function gpioControlStoneGroup4() {
  const button = document.getElementById("曝气石组4");
  if (ssg4 == 0) {
    button.style.backgroundColor = "#FF0000";
    ssg4 = 1;
    sdata=replacepos(sdata,5,5,'T');
    sendMessage();
  } else {
    button.style.backgroundColor = "#EEE";
    ssg4 = 0;
    sdata=replacepos(sdata,5,5,'F');
    sendMessage();
  }
}

function gpioControlPump1() {
  const button = document.getElementById("回流泵1");
  if (sp1 == 0) {
    button.style.backgroundColor = "#FF0000";
    sp1 = 1;
    sdata=replacepos(sdata,6,6,'T');
    sendMessage();
  } else {
    button.style.backgroundColor = "#EEE";
    sp1 = 0;
    sdata=replacepos(sdata,6,6,'F');
    sendMessage();
  }
}

function gpioControlPump2() {
  const button = document.getElementById("回流泵2");
  if (sp2 == 0) {
    button.style.backgroundColor = "#FF0000";
    sp2 = 1;
    sdata=replacepos(sdata,7,7,'T');
    sendMessage();
  } else {
    button.style.backgroundColor = "#EEE";
    sp2 = 0;
    sdata=replacepos(sdata,7,7,'F');
    sendMessage();
  }
}

function gpioControlPump3() {
  const button = document.getElementById("回流泵3");
  if (sp3 == 0) {
    button.style.backgroundColor = "#FF0000";
    sp3 = 1;
    sdata=replacepos(sdata,8,8,'T');
    sendMessage();
  } else {
    button.style.backgroundColor = "#EEE";
    sp3 = 0;
    sdata=replacepos(sdata,8,8,'F');
    sendMessage();
  }
}

function pwmControlPlate1() {
  // 目前尚未知道如何获取触发物体的特性
  var value = document.getElementById("曝气盘1拉条").value / 10;
  if(value!=0)
    sb1=1;
  else
    sb1=0;
  if(value==10)
    value='A';
  // 使用ES6模板字符串
  sdata=replacepos(sdata,9,9,value);
  sendMessage();
}

function pwmControlPlate2() {
  var value = document.getElementById("曝气盘2拉条").value / 10;
  if(value!=0)
    sb2=1;
  else
    sb2=0;
  if(value==10)
    value='A';
  sdata=replacepos(sdata,10,10,value);
  sendMessage();
}

function pwmControlPlate3() {
  var value = document.getElementById("曝气盘3拉条").value / 10;
  if(value!=0)
    sb3=1;
  else
    sb3=0;
  if(value==10)
    value='A';
  sdata=replacepos(sdata,11,11,value);
  sendMessage();
}

function pwmControlPlate4() {
  var value = document.getElementById("曝气盘4拉条").value / 10;
  if(value!=0)
    sb4=1;
  else
    sb4=0;
  if(value==10)
    value='A';
  sdata=replacepos(sdata,12,12,value);
  sendMessage();
}

function pwmControlPlate5() {
  var value = document.getElementById("曝气盘5拉条").value / 10;
  if(value!=0)
    sb5=1;
  else
    sb5=0;
  if(value==10)
    value='A';
  sdata=replacepos(sdata,13,13,value);
  sendMessage();
}

function pwmControlPlate6() {
  var value = document.getElementById("曝气盘6拉条").value / 10;
  if(value!=0)
    sb6=1;
  else
    sb6=0;
  if(value==10)
    value='A';
  sdata=replacepos(sdata,14,14,value);
  sendMessage();
}

function dataDetection() {
  const button = document.getElementById("数据监测");
  if (is_on == 0) {
    button.style.backgroundColor = "#FF0000";
    is_on = 1;
  } else {
    button.style.backgroundColor = "#EEE";
    is_on = 0;
  }
}

function controlReset() {
  sdata = 'FFFFFFFFF000000';
  sendMessage();
  const button1 = document.getElementById("桨叶1");
  const button2 = document.getElementById("桨叶2");
  const button3 = document.getElementById("曝气石组1");
  const button4 = document.getElementById("曝气石组2");
  const button5 = document.getElementById("曝气石组3");
  const button6 = document.getElementById("曝气石组4");
  const button7 = document.getElementById("曝气石组1");
  const button8 = document.getElementById("回流泵1");
  const button9 = document.getElementById("回流泵2");
  const button10 = document.getElementById("回流泵3");
  const drag1 = document.getElementById("曝气盘1拉条");
  const drag2 = document.getElementById("曝气盘2拉条");
  const drag3 = document.getElementById("曝气盘3拉条");
  const drag4 = document.getElementById("曝气盘4拉条");
  const drag5 = document.getElementById("曝气盘5拉条");
  const drag6 = document.getElementById("曝气盘6拉条");
  button1.style.backgroundColor = "#EEE";
  button2.style.backgroundColor = "#EEE";
  button3.style.backgroundColor = "#EEE";
  button4.style.backgroundColor = "#EEE";
  button5.style.backgroundColor = "#EEE";
  button6.style.backgroundColor = "#EEE";
  button7.style.backgroundColor = "#EEE";
  button8.style.backgroundColor = "#EEE";
  button9.style.backgroundColor = "#EEE";
  button10.style.backgroundColor = "#EEE";
  drag1.value = 0;
  drag2.value = 0;
  drag3.value = 0;
  drag4.value = 0;
  drag5.value = 0;
  drag6.value = 0;
  sf1 = 0;
  sf2 = 0;
  ssg1 = 0;
  ssg2 = 0;
  ssg3 = 0;
  ssg4 = 0;
  sp1 = 0;
  sp2 = 0;
  sp3 = 0;
  sb1 = 0;
  sb2 = 0;
  sb3 = 0;
  sb4 = 0;
  sb5 = 0;
  sb6 = 0;
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

$(document).ready(function () {
  // 获取当前时间demo

  $.ajax({
    url: baseUrl, //首先请求一次后台，再进行其他操作
    dataType: "json", // 预期返回的数据类型，如果是json格式，在接收到返回时会自动封装成json对象
    type: "get", // 请求方式
    async: true, // 是否异步请求
    success: function (data) {
      console.log("成功！");
    },
    error: function (arg1) {},
  });
  // $.ajax({
  //   url: baseUrl+'start_get', //首先请求一次后台，再进行其他操作
  //   dataType: "json", // 预期返回的数据类型，如果是json格式，在接收到返回时会自动封装成json对象
  //   type: "get", // 请求方式
  //   async: false, // 是否异步请求
  //   success: function (data) {
  //     console.log("成功！");
  //   },
  //   error: function (arg1) {
  //   },
  // });
  $("a").on("click", function () {
    $("#" + mode_id).removeClass("active");
    $(this).addClass("active");
    mode_id = $(this).attr("id");
    if(mode_id=='mode1')
      controlReset();
    else if(mode_id=='mode2')
      timingMode();
    else
      intelligentMode();
  });

  $(function () {
    let text = $("#fTbody:first");
    let status = $("#在线监测");
    // 请求数据完成时，更改temp的值，可以更新页面时，再将temp的值给页面
    let requestInterval; // 定义请求间隔句柄
    let updateInterval; // 定义需要清除动画的部分
    let tr_tmp1 =
      "<tr><td>2023-07-21 13:07:38</td><td>25.48</td><td>123.28</td><td>9.7</td><td>129.11</td></tr>";
    let tr_tmp2 =
      "<tr><td>2023-07-21 13:07:41</td><td>25.52</td><td>123.78</td><td>10.2</td><td>128.98</td></tr>";
    let tr_tmp3 =
      "<tr><td>2023-07-21 13:07:44</td><td>26.28</td><td>123.54</td><td>9.9</td><td>128.76</td></tr>";
    let tr_tmp4 =
      "<tr><td>2023-07-21 13:07:47</td><td>24.53</td><td>123.23</td><td>10.1</td><td>129.68</td></tr>";
    // 添加鼠标悬停事件，悬停时页面数据暂时不会更新，但是悬停结束后会变成最新数据
    text
      .hover(
        // 参数为鼠标移入和移出的句柄函数
        function () {
          clearInterval(requestInterval);
        },
        function () {
          // 请求&页面更新数据，用两个计时器实现，鼠标移入只会暂停页面更新数据
          requestInterval = setInterval(function () {
            if (is_on)
              $.ajax({
                url: baseUrl + "/query1", //后台请求的数据
                dataType: "json", // 预期返回的数据类型，如果是json格式，在接收到返回时会自动封装成json对象
                type: "get", // 请求方式
                async: true, // 是否异步请求
                success: function (data) {
                  data = data[0];
                  let td;
                  td = "<td>" + data["datetime"] + "</td>";
                  td +=
                    "<td>" +
                    (Number(data["temperature"])).toFixed(2) +
                    "</td>";
                  td +=
                    "<td>" +
                    (Number(data["ORP"])).toFixed(2) +
                    "</td>";
                  td +=
                    "<td>" +
                    (Number(data["PH"])).toFixed(1) +
                    "</td>";
                  td +=
                    "<td>" +
                    (Number(data["TDS"])).toFixed(2) +
                    "</td>";
                  tr_tmp1 = tr_tmp2;
                  tr_tmp2 = tr_tmp3;
                  tr_tmp3 = tr_tmp4;
                  tr_tmp4 = "<tr>" + td + "</tr>";
                  console.log(td);
                },
                error: function (arg1) {
                  console.log(arg1);
                  alert("加载数据失败");
                },
              });
            text.html(tr_tmp1 + tr_tmp2 + tr_tmp3 + tr_tmp4);
          }, IntervalTime);
          // updateInterval = setInterval(function () {
          //   if (is_on) text.html(tr_tmp1 + tr_tmp2 + tr_tmp3+tr_tmp4);
          // }, IntervalTime); // 滚动间隔时间
        }
      )
      .trigger("mouseleave");
  });
});
