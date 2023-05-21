from flask import Flask, request  # 导入Flask模块
from flask_cors import cross_origin
import requests
import json

# 创建Flask的实例对象
# app = Flask(__name__) # 确定工程文件目录 -> Flask('模块名')
# app = Flask(__name__, static_url_path='/s')
app = Flask(__name__, static_url_path='/s',
            static_folder='static', template_folder='templates')
token_jxy = ""
token_lj = ""
# 首先需要获取token，为获取设备信息提供身份验证


@app.route('/')
@cross_origin()
def start():
    url = r"https://iam.cn-north-4.myhuaweicloud.com/v3/auth/tokens"
    Headers = {
        "Content-Type": "application/json"
    }
    Body_jxy = {
        "auth": {
            "identity": {
                "methods": [
                    "password"
                ],
                "password": {
                    "user": {
                        "name": "jx1",
                        "password": "mayuguojia4",
                        "domain": {
                            "name": "hw091458930"
                        }
                    }
                }
            },
            "scope": {
                "project": {
                    "name": "cn-north-4"
                }
            }
        }
    }
    Body_gjq = {
        "auth": {
            "identity": {
                "methods": [
                    "password"
                ],
                "password": {
                    "user": {
                        "name": "IoT-Water",
                        "password": "GJQ1030ab",
                        "domain": {
                            "name": "jiaqiyun"
                        }
                    }
                }
            },
            "scope": {
                "project": {
                    "name": "cn-north-4"
                }
            }
        }
    }
    Body_lj = {
        "auth": {
            "identity": {
                "methods": [
                    "password"
                ],
                "password": {
                    "user": {
                        "name": "l610",
                        "password": "bbj65!l$T21Eo5_OIW%",
                        "domain": {
                            "name": "hid_vu7_0n22q488zpp"
                        }
                    }
                }
            },
            "scope": {
                "project": {
                    "name": "cn-north-4"
                }
            }
        }
    }
    try:
        response_jxy = requests.post(url=url, headers=Headers, json=Body_jxy)
        # response_gjq = requests.post(url=url, headers=Headers, json=Body_gjq)
        response_lj = requests.post(url=url, headers=Headers, json=Body_lj)
        global token_jxy, token_gjq, token_lj
        token_jxy = response_jxy.headers["X-Subject-Token"]
        # token_gjq = response_gjq.headers["X-Subject-Token"]
        token_lj = response_lj.headers["X-Subject-Token"]
        global token_flag
        token_flag = True
        return "Get Token OK!"
    except:
        return "Get Token Failed!"


@app.route('/test', methods=["GET","POST"])
@cross_origin()
def putData():
    # 设备链接
    url_lj = "https://53e4ab6e10.st1.iotda-app.cn-north-4.myhuaweicloud.com:443/v5/iot/261f2cd698b848f591436f9adce09d89/devices/6423d2874f1d6803244d4326_L610/properties?service_id=Sprayswitchcontrol"
    Headers = {
        "X-Auth-Token": token_lj
    }
    # 发送Body中所包含的信息
    Params_lj = {
        "project_id": "261f2cd698b848f591436f9adce09d89",
        "device_id": "6423d2874f1d6803244d4326_L610",
        # "service_id": "Sprayswitchcontrol"
    }
    if request.method =='POST':
        servicesContent = request.get_json()  # 获取字典格式数据
        BodyDict = dict()
        BodyDict["services"] = servicesContent
        Body = json.dumps(BodyDict)
        print(Body)
    # Body = {
    #     "services": {
    #         "LED0_STATE": 1,
    #         "LED1_STATE": 1,
    #         "LED2_STATE": 1,
    #         "LED3_STATE": 0,
    #         "LED4_STATE": 0,
    #         "LED5_STATE": 0,
    #         "LED6_STATE": 0,
    #         "LED7_STATE": 1,
    #     }
    # }
    res = requests.put(url=url_lj, headers=Headers,
                        params=Params_lj, json=Body)  # 给华为云传数据
    return "数据发送成功"

# 装饰器（路由）


@app.route('/data', methods=['POST', 'GET'])
@cross_origin()
# 视图函数
def getData():
    url_lj = "https://53e4ab6e10.st1.iotda-app.cn-north-4.myhuaweicloud.com:443/v5/iot/261f2cd698b848f591436f9adce09d89/devices/6423d2874f1d6803244d4326_L610/properties?service_id=Sprayswitchcontrol"
    url_jxy = "https://59a6084cfa.st1.iotda-app.cn-north-4.myhuaweicloud.com:443/v5/iot/35bacf8d0d634b3f8a70fc9b5286d79d/devices/641e635340773741f9fc2714_L610_CN2023/properties?service_id=SpraySwitch"
    # token = token_lj
    token = token_lj
    # file_path = "test.bmp"
    # f = request.files['pic']
    # if request.method == ''
    headers = {
        'X-Auth-Token': token
    }
    Params = {
        # "project_id": "aea03e9c-8e9f-40f8-bc4e-51666f7245a8",
        # "device_id": "6423d2874f1d6803244d4326_L610",
        "service_id": "Sprayswitchcontrol"
        # "project_id": "35bacf8d0d634b3f8a70fc9b5286d79d",
        # "device_id": "641e635340773741f9fc2714_L610_CN2023",
        # "service_id": "SpraySwitch"
    }
    # files = {
    # 'images': f.read()
    # 'images': open(file_path, 'rb')
    # }
    properties = ''
    try:
        resp = requests.get(url_lj, headers=headers, params=Params)
        data = json.loads(resp.text)
        response = data["response"]
        services = response["services"][0]
        properties = services["properties"]
    except:
        # print(data)
        pass
    print(properties)
    return properties


if __name__ == '__main__':
    app.run(host='0.0.0.0')
