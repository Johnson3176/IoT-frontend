// 定义全局变量

var is_on = false;
var IntervalTime = 1000;
var auto_control = 1;

function setScale() {
  let designWidth = 1440; //设计稿的宽度，根据实际项目调整
  let designHeight = 1024; //设计稿的高度，根据实际项目调整
  let scale =
    document.documentElement.clientWidth /
      document.documentElement.clientHeight <
    designWidth / designHeight
      ? document.documentElement.clientWidth / designWidth
      : document.documentElement.clientHeight / designHeight;
  document.querySelector("#screen").style.transform = `scale(${scale})`;
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
  // 曝气控制信号发送
  {
    $.ajax({
      url:'http://192.168.92.178:5000/test',  //后台接口地址
      type:'post',  //post请求方式
      async: true,
      dataType:'json',
      contentType:'application/json;charset=utf-8',
      data:JSON.stringify({"LED0_STATE":1,"LED1_STATE":0,"LED2_STATE":1,"LED3_STATE":0,
                          "LED4_STATE":0,"LED5_STATE":0,"LED6_STATE":0,"LED7_STATE":0}),
      success:function(data){
        alert(data);
        console.log('请求成功')
      },
      error:function(){
      }
    })
  }
}

function selectMode(obj){
  // const targetElement = obj.target;
  const button = document.getElementById("曝气控制");
  const button1 = document.getElementById("自动");
  const button2 = document.getElementById("手动");
  button.style.display='inline-block';
  button1.style.display='none';
  button2.style.display='none';
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
  $(function () {
    let text = $("#fTbody:first");
    let status = $("#在线监测");
    // 请求数据完成时，更改temp的值，可以更新页面时，再将temp的值给页面
    let requestInterval; // 定义请求间隔句柄
    let updateInterval; // 定义需要清除动画的部分
    let controlInterval; // 定义控制信号请求句柄
    let tr_tmp1 = "<tr><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>";
    let tr_tmp2 = tr_tmp1,
      tr_tmp3 = tr_tmp1;

    controlInterval = setInterval(function () {
      if (auto_control)
        $.ajax({
          url: "http://192.168.43.12:5000", //后台请求的数据
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
            console.log(1);
          },
        });
    }, IntervalTime * 2);

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
