$.ajax({
      url:'http://192.168.64.219:5000/ctrl_motor3/1',  //后台接口地址
      type:'get',  //get请求方式
      async: true,
      dataType:'json',
      contentType:'application/json;charset=utf-8',
      success:function(data){
        // alert(data);
        console.log('请求成功')
      },
      error:function(){
  
      }
    })