from flask import Flask  # 导入Flask模块
from flask_sqlalchemy import SQLAlchemy
from flask_cors import cross_origin
from datetime import datetime
import time
from threading import Thread
import requests
import json
import random
from flask import request

app = Flask(__name__, static_url_path='/s', static_folder='static', template_folder='templates')

HOSTNAME = "127.0.0.1"  # MySQL所在主机名
PORT = 3306  # MySQL监听的端口号，默认3306
USERNAME = "root"  # 连接MySQL的用户名，自己设置
PASSWORD = "GJQ123"  # 连接MySQL的密码，自己设置
DATABASE = "WaterData"  # MySQL上创建的数据库名称
# 通过修改以下代码来操作不同的SQL比写原生SQL简单很多 --> 通过ORM可以实现从底层更改使用的SQL
app.config[
    'SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{USERNAME}:{PASSWORD}@{HOSTNAME}:{PORT}/{DATABASE}?charset=utf8mb4"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = True
db = SQLAlchemy(app)

token_jxy = ""  # Token 调用IoTDA
token_gjq = ""  # Token 调用ModelArts
token_flag = False  # 已获取Token标识


# 定义table WaterData
class WaterData(db.Model):
    __tablename__ = "Data"

    id = db.Column("id", db.Integer, primary_key=True, autoincrement=True)
    datetime = db.Column(db.DateTime)
    temperature = db.Column(db.Float)
    DO = db.Column(db.Float)
    PH = db.Column(db.Float)
    TDS = db.Column(db.Float)


def query2dict(model_list):
    if isinstance(model_list, list):  # 如果传入的参数是一个list类型的，说明是使用的all()的方式查询的
        if isinstance(model_list[0], db.Model):  # 这种方式是获得的整个对象  相当于 select * from table
            lst = []
            for model in model_list:
                dic = {}
                for col in model.__table__.columns:
                    dic[col.name] = getattr(model, col.name)
                lst.append(dic)
            return lst
        else:  # 这种方式获得了数据库中的个别字段  相当于select id,name from table
            lst = []
            for result in model_list:  # 当以这种方式返回的时候，result中会有一个keys()的属性
                lst.append([dict(zip(result.keys, r)) for r in result])
            return lst
    else:  # 不是list,说明是用的get() 或者 first()查询的，得到的结果是一个对象
        if isinstance(model_list, db.Model):  # 这种方式是获得的整个对象  相当于 select * from table limit=1
            dic = {}
            for col in model_list.__table__.columns:
                dic[col.name] = getattr(model_list, col.name)
            return dic
        else:  # 这种方式获得了数据库中的个别字段  相当于select id,name from table limit = 1
            return dict(zip(model_list.keys(), model_list))


# 多线程实现数据实时更新
class Async_getData:
    """
    使用装饰器实现多线程的异步非阻塞向IoTDA的API获取数据，存入数据库
    """

    def start_async(*args):
        fun = args[0]

        def start_thread(*args, **kwargs):
            """启动线程（内部方法）"""
            t = Thread(target=fun, args=args, kwargs=kwargs)
            t.start()

        return start_thread

    @start_async
    def get_data_thread(*args):
        with app.app_context():
            db.create_all()  # 在数据库中生成数据表
            db.session.commit()
        while 1:
            if token_flag:  # 已获取token
                print("Getting data...")
                url = r"https://59a6084cfa.st1.iotda-app.cn-north-4.myhuaweicloud.com:443/v5/iot/35bacf8d0d634b3f8a70fc9b5286d79d/devices/641e635340773741f9fc2714_L610_CN2023/properties?service_id=SpraySwitch"
                Params = {"service_id": "SpraySwitch"}
                Headers = {
                    "X-Auth-Token": token_jxy}
                response = requests.get(url=url, params=Params, headers=Headers)
                res = json.loads(response.text)
                print(res)
                with app.app_context():
                    try:
                        add = WaterData(datetime=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                                        temperature=res['response']['services'][0]['properties']['MyTest'],
                                        PH=5.9 + round(random.random(), 1), DO=2.5 + 0.2*round(random.random(), 2),
                                        TDS=0.56 + 0.1*round(random.random(), 2))
                        db.session.add(add)
                        db.session.commit()
                    except KeyError:  # 如果数据获取有误
                        # add = WaterData(datetime=datetime.now().strftime('%Y-%m-%d %H:%M:%S'), temperature=100.0, PH=5.9, DO=2.5, TDS=0.56)
                        pass
                time.sleep(1)


# 根目录获取token，每次启动更新
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
    try:
        response_jxy = requests.post(url=url, headers=Headers, json=Body_jxy)
        response_gjq = requests.post(url=url, headers=Headers, json=Body_gjq)
        global token_jxy, token_gjq
        token_jxy = response_jxy.headers["X-Subject-Token"]
        token_gjq = response_gjq.headers["X-Subject-Token"]
        global token_flag
        token_flag = True
        return "Get Token OK!"
    except:
        return "Get Token Failed!"


# 启动获取数据线程
@app.route('/start')
@cross_origin()
def start_get_data():
    Async_getData().get_data_thread()  # 启动异步线程
    return 'Start get data and store into MySQL.'


# 查询设备属性数据
@app.route('/query')
@cross_origin()
def query_data():
    res = query2dict(WaterData.query.all())
    res_convert = []
    for dic in res:
        dic['datetime'] = dic['datetime'].strftime('%Y-%m-%d %H:%M:%S')
        res_convert.append(dic)
    return res_convert[-1]


# 使用LSTM算法预测下一个
@app.route('/lstm')
@cross_origin()
def predict_data_lstm():
    # url = "https://c8af6bb488604c9896ae462d73d7056d.apigw.cn-north-4.huaweicloud.com/v1/infers/01ee8b10-b5fa-4a7c-94bc-4f417b63a76c"
    # Headers = {
    #     "X-Auth-Token": token_gjq}
    url = "https://192.168.203.131:1026"
    Body = {
        "history": [5.479, 5.600, 5.715, 5.826, 5.933, 6.035, 6.133, 6.226, 6.315, 6.399, 6.479, 6.555, 6.626, 6.692,
                    6.754, 6.812, 6.865, 6.913, 6.958, 6.997, 7.032, 7.063, 7.089, 7.111, 7.147, 7.145, 7.111, 7.061,
                    6.970, 6.858, 6.829, 6.788, 6.705, 6.650, 6.578, 6.523, 6.542, 6.559, 6.551, 6.527, 6.530, 6.550,
                    6.566, 6.595, 6.575, 6.558, 6.520, 6.480]
    }
    # res = requests.post(url=url, headers=Headers, json=Body)
    res = requests.post(url=url, json=Body, verify=False)
    # print(json.loads(res.text)[0]['predict'])
    return [json.loads(res.text)[0]['predict']]


# 使用SVM算法预测下一个
@app.route('/svm')
@cross_origin()
def predict_data_svm():
    # url = "https://c8af6bb488604c9896ae462d73d7056d.apigw.cn-north-4.huaweicloud.com/v1/infers/1cbd3692-732f-4d7f-bcf7-70a0081f4606"
    # Headers = {
    #     "X-Auth-Token": token_gjq}
    url = "https://192.168.203.131:1025"
    Body = {
        "history": [5.479, 5.600, 5.715]
    }
    # res = requests.post(url=url, headers=Headers, json=Body)
    requests.packages.urllib3.disable_warnings()
    res = requests.post(url=url, json=Body, verify=False)
    # print(json.loads(res.text)['data']['resp_data'][0]['predictresult'])
    return [json.loads(res.text)['data']['resp_data'][0]['predictresult']]
    # print(request.get_json())


# 控制第num个气泵的速度为speed
@app.route('/ctrl_motor<num>/<speed>')
@cross_origin()
def control_motor(num, speed):
    url = r"https://59a6084cfa.st1.iotda-app.cn-north-4.myhuaweicloud.com:443/v5/iot/35bacf8d0d634b3f8a70fc9b5286d79d/devices/63dcdaa2352830580e47364e_2023_3_25/commands"
    Headers = {
        "X-Auth-Token": token_jxy,
        'Content-Type': 'application/json'}
    Body = {
        "service_id": "Motor_Control_System",
        "command_name": f"Motor{num}_Control",
        "paras": {
            f"Motor{num}": f"{speed}"
        }
    }
    command = requests.post(url=url, json=Body, headers=Headers)
    res = command.status_code
    return str(res)

# 控制第num个switch的速度为speed
@app.route('/ctrl_switch<num>/<state>')
@cross_origin()
def control_switch(num, state):
    url = r"https://59a6084cfa.st1.iotda-app.cn-north-4.myhuaweicloud.com:443/v5/iot/35bacf8d0d634b3f8a70fc9b5286d79d/devices/63dcdaa2352830580e47364e_2023_3_25/commands"
    Headers = {
        "X-Auth-Token": token_jxy,
        'Content-Type': 'application/json'}
    Body = {
        "service_id": "Switch_Control_System",
        "command_name": f"Switch{num}_Control",
        "paras": {
            f"Switch{num}": f"{state}"
        }
    }
    print({f"Switch{num}": f"{state}"})
    command = requests.post(url=url, json=Body, headers=Headers)
    res = command.status_code
    return str(res)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=False)
