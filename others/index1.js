

const core = require('@huaweicloud/huaweicloud-sdk-core');
const iotda = require("@huaweicloud/huaweicloud-sdk-iotda");
const ak = "ALAZX1UEZQMZ2UPE3OHV";
const sk = "ouIcAoKcgV48lJDKhOCnwcrIUmqZYsECP872ychP";
// endpoint：请在控制台的"总览"界面的"平台接入地址"中查看“应用侧”的https接入地址。
// const endpoint = "https://iotda.cn-north-4.myhuaweicloud.com";
const endpoint = "2006c0fe16.iotda.cn-north-4.myhuaweicloud.com";
const project_id = "57bdf41f79fa4c958c7730a12886f995";
// 创建认证
const credentials = new core.BasicCredentials()
                     .withAk(ak)
                     .withSk(sk)
                     .withProjectId(project_id)
// 创建IoTDAClient实例并初始化
const client = iotda.IoTDAClient.newBuilder()
                            .withCredential(credentials)
                            .withEndpoint(endpoint)
                            .build();
// 实例化请求对象
const request = new iotda.ListDevicesRequest();
// 调用查询设备列表接口
const result = client.listDevices(request);
result.then(result => {
    console.log("JSON.stringify(result)::" + JSON.stringify(result));
}).catch(ex => {
    console.log("exception:" + JSON.stringify(ex));
});


// // index.ts
// import { ListVpcsRequest, VpcClient } from "@huaweicloud/huaweicloud-sdk-vpc";
// import { BasicCredentials } from "@huaweicloud/huaweicloud-sdk-core/auth/BasicCredentials";

// const ak = 'ALAZX1UEZQMZ2UPE3OHV';
// const sk = 'ouIcAoKcgV48lJDKhOCnwcrIUmqZYsECP872ychP';
// const projectId = '57bdf41f79fa4c958c7730a12886f995';
// const endpoint = '2006c0fe16.iotda.cn-north-4.myhuaweicloud.com';

// const credentials = new BasicCredentials()
//   .withAk(ak)
//   .withSk(sk)
//   .withProjectId(projectId);

// const client = VpcClient.newBuilder()
//   .withCredential(credentials)
//   .withEndpoint(endpoint)
//   .build();


// (async () => {
//   try {
//     const request = new ListVpcsRequest();
//     const result = await client.listVpcs(request);
//     console.log("Result:", JSON.stringify(result, null, 2));
//   } catch (error:any) {
//     console.error("Exception:", JSON.stringify(error, null, 2));
//   }
// })();