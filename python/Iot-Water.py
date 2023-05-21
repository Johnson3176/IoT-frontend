from flask import Flask  # 导入Flask模块
from flask_sqlalchemy import SQLAlchemy
from flask_cors import cross_origin
from datetime import datetime
import time
from threading import Thread
import requests
import json

app = Flask(__name__, static_url_path='/s', static_folder='static', template_folder='templates')

HOSTNAME = "127.0.0.1"  # MySQL所在主机名
PORT = 3306  # MySQL监听的端口号，默认3306
USERNAME = "root"  # 连接MySQL的用户名，自己设置
PASSWORD = "pq/#Bm&N!5B*"  # 连接MySQL的密码，自己设置
DATABASE = "WaterData"  # MySQL上创建的数据库名称
# 通过修改以下代码来操作不同的SQL比写原生SQL简单很多 --》通过ORM可以实现从底层更改使用的SQL
app.config[
    'SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{USERNAME}:{PASSWORD}@{HOSTNAME}:{PORT}/{DATABASE}?charset=utf8mb4"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = True
db = SQLAlchemy(app)


# 定义table WaterData
class WaterData(db.Model):
    __tablename__ = "Data"

    id = db.Column("id", db.Integer, primary_key=True, autoincrement=True)
    datetime = db.Column(db.DateTime)
    temperature = db.Column(db.Float)
    DO = db.Column(db.Float)
    PH = db.Column(db.Float)
    TDS = db.Column(db.Float)


# with app.app_context():
#     db.create_all()  # 在数据库中生成数据表
#     # 插入数据
#     add1 = WaterData(datetime=datetime.now().strftime('%Y-%m-%d %H:%M:%S'), temperature=20.5, PH=5.9, DO=2.5, TDS=0.56)
#     add2 = WaterData(datetime=datetime.now().strftime('%Y-%m-%d %H:%M:%S'), temperature=20.6, PH=5.8, DO=2.5, TDS=0.56)
#     add3 = WaterData(datetime=datetime.now().strftime('%Y-%m-%d %H:%M:%S'), temperature=20.5, PH=5.5, DO=2.5, TDS=0.56)
#     add4 = WaterData(datetime=datetime.now().strftime('%Y-%m-%d %H:%M:%S'), temperature=20.5, PH=5.4, DO=2.5, TDS=0.56)
#     db.session.add(add1)
#     db.session.add(add2)
#     db.session.add(add3)
#     db.session.add(add4)
#     db.session.commit()
# with app.app_context():
#     print(query2dict(WaterData.query.all()))


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
        while 1:
            print("Getting data...")
            url = r"https://59a6084cfa.st1.iotda-app.cn-north-4.myhuaweicloud.com:443/v5/iot/35bacf8d0d634b3f8a70fc9b5286d79d/devices/641e635340773741f9fc2714_L610_CN2023/properties?service_id=SpraySwitch"
            Params = {"service_id": "SpraySwitch"}
            Headers = {
                "X-Auth-Token": "MIIUMgYJKoZIhvcNAQcCoIIUIzCCFB8CAQExDTALBglghkgBZQMEAgEwghJEBgkqhkiG9w0BBwGgghI1BIISMXsidG9rZW4iOnsiZXhwaXJlc19hdCI6IjIwMjMtMDQtMjZUMDU6NTk6MzQuNTAzMDAwWiIsIm1ldGhvZHMiOlsicGFzc3dvcmQiXSwiY2F0YWxvZyI6W10sInJvbGVzIjpbeyJuYW1lIjoidGVfYWRtaW4iLCJpZCI6IjAifSx7Im5hbWUiOiJ0ZV9hZ2VuY3kiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3Nfc3BvdF9pbnN0YW5jZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2l2YXNfdmNyX3ZjYSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FfY24tc291dGgtNGMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3Nfa2FlMSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2ludGxfb2EiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9Lb29TZWFyY2hDT0JUIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZHdzX3BvYyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Nicl9maWxlIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX2tjMV91c2VyX2RlZmluZWQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tZWV0aW5nX2VuZHBvaW50X2J1eSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FfbGEtbm9ydGgtMmMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tYXBfbmxwIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfcmVkaXM2LWdlbmVyaWMtaW50bCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Rjc19kY3MyLWVudGVycHJpc2UiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF92Y3AiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jdnIiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9rb29waG9uZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX211bHRpX2JpbmQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9hX2FwLXNvdXRoZWFzdC0zZCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3Byb2plY3RfZGVsIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY2VyIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY2VzX3Jlc291cmNlZ3JvdXBfdGFnIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZXZzX3JldHlwZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2tvb21hcCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2V2c19lc3NkMiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19pcjN4IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9jbi1zb3V0aHdlc3QtMmIiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jc2VfbmFjb3MiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9od2RldiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3Nmc3R1cmJvIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfaHZfdmVuZG9yIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9jbi1ub3J0aC00ZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FfY24tbm9ydGgtNGQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kYXl1X2RsbV9jbHVzdGVyIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX2FjNyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NjZV9tY3BfdGhhaSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NvbXBhc3MiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lZHMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9zZXJ2aWNlc3RhZ2VfbWdyX2R0bSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FfY24tbm9ydGgtNGYiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9vYSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3Nmc19saWZlY3ljbGUiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jcGgiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9nYSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3JtcyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3Ntbl9hcHBsaWNhdGlvbiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX29yZ2FuaXphdGlvbnMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfZ3B1X2c1ciIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3drc19rcCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3JpX2R3cyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FhZF9iZXRhX2lkYyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NzYnNfcmVwX2FjY2VsZXJhdGlvbiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19kaXNrQWNjIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZHNzX21vbnRoIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfb2JzX2RlZXBfYXJjaGl2ZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2NzZyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2RlY19tb250aF91c2VyIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfaWVmX2VkZ2VhdXRvbm9teSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3ZpcF9iYW5kd2lkdGgiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3Nfb2xkX3Jlb3VyY2UiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF91Y3Nfb25fcHJlbWlzZXNfaW50bCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3dlbGlua2JyaWRnZV9lbmRwb2ludF9idXkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfdGhpcmRfaW1hZ2UiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9wc3RuX2VuZHBvaW50X2J1eSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX21hcF9vY3IiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9kbHZfb3Blbl9iZXRhIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfb2JzX2R1YWxzdGFjayIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2VkY20iLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9vYnNfZGVjX21vbnRoIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY3Nic19yZXN0b3JlIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfaXZzY3MiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfYzZhIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfRUNfT0JUIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfdnBuX3ZndyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3Ntbl9jYWxsbm90aWZ5IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfb3BfZ2F0ZWRfbGFrZWZvcm1hdGlvbl9iZXQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9jc2JzX3Byb2dyZXNzYmFyIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfaWR0X2RtZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Vjc19vZmZsaW5lX2FjNyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2V2c19wb29sX2NhIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX29mZmxpbmVfZGlza180IiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfaW50bF9jb21wYXNzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfdWNzX29uX2F3c19pbnRsIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZXBzIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfY3Nic19yZXN0b3JlX2FsbCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX29yZ2FuaXphdGlvbnNfaW50bCIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2Zjc19wYXkiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9hX2FwLXNvdXRoZWFzdC0xZSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX2FfcnUtbW9zY293LTFiIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfYV9hcC1zb3V0aGVhc3QtMWQiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9hX2FwLXNvdXRoZWFzdC0xZiIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3JhbSIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX29wX2dhdGVkX21lc3NhZ2VvdmVyNWciLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9lY3NfYzciLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9tYXBfdmlzaW9uIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfZWNzX3JpIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfdWNzX29ucHJlbWlzZXMiLCJpZCI6IjAifSx7Im5hbWUiOiJvcF9nYXRlZF9hX3J1LW5vcnRod2VzdC0yYyIsImlkIjoiMCJ9LHsibmFtZSI6Im9wX2dhdGVkX3JhbV9pbnRsIiwiaWQiOiIwIn0seyJuYW1lIjoib3BfZ2F0ZWRfaWVmX3BsYXRpbnVtIiwiaWQiOiIwIn1dLCJwcm9qZWN0Ijp7ImRvbWFpbiI6eyJuYW1lIjoiaHcwOTE0NTg5MzAiLCJpZCI6IjkzYzViODEyOGJiZDQ4NWU4Y2Y3NjE1ZDIzY2MxYzUwIn0sIm5hbWUiOiJjbi1ub3J0aC00IiwiaWQiOiIzNWJhY2Y4ZDBkNjM0YjNmOGE3MGZjOWI1Mjg2ZDc5ZCJ9LCJpc3N1ZWRfYXQiOiIyMDIzLTA0LTI1VDA1OjU5OjM0LjUwMzAwMFoiLCJ1c2VyIjp7ImRvbWFpbiI6eyJuYW1lIjoiaHcwOTE0NTg5MzAiLCJpZCI6IjkzYzViODEyOGJiZDQ4NWU4Y2Y3NjE1ZDIzY2MxYzUwIn0sIm5hbWUiOiJqeDEiLCJwYXNzd29yZF9leHBpcmVzX2F0IjoiIiwiaWQiOiI4MzAxYmI0ZTBkNmI0ZWI0YmRiZGI3M2Y1MTc5ODgwNCJ9fX0xggHBMIIBvQIBATCBlzCBiTELMAkGA1UEBhMCQ04xEjAQBgNVBAgMCUd1YW5nRG9uZzERMA8GA1UEBwwIU2hlblpoZW4xLjAsBgNVBAoMJUh1YXdlaSBTb2Z0d2FyZSBUZWNobm9sb2dpZXMgQ28uLCBMdGQxDjAMBgNVBAsMBUNsb3VkMRMwEQYDVQQDDApjYS5pYW0ucGtpAgkA3LMrXRBhahAwCwYJYIZIAWUDBAIBMA0GCSqGSIb3DQEBAQUABIIBADTgCrMhx8s84MYDDsxn26BSXpdf1g+OUz0RCl3jEf3Zv3ya74pU1r90VmeNtJ+LFkv00UnihjskdejBg0I-mkn6zbdMYpDVlVmQPbafQMaWmugpOIpE31GZw4uyj30I9JmPyQrypbf+lJ0Q57Vth-5+YoKky7R-Z0ebwtUTNmdsXQ9TKCSjSQRv29lFiMiZUWqq7Jx5nmFBlKlR4w8oWopx2WGmjNt59tjYx89toLzRHiUM9EVb-D+2u3D3rvRcvvdXMB58Ssdi6FduA5CovFlzsFN6QgjVjCYyXmn6cekRlTd6oiyh0m1vg8SumAGGK5Fh7iBPI152qDWHfbZPGjA="}
            response = requests.get(url=url, params=Params, headers=Headers)
            res = json.loads(response.text)
            print(res)
            with app.app_context():
                try:
                    add = WaterData(datetime=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                                    temperature=res['response']['services'][0]['properties']['MyTest'], PH=5.9, DO=2.5,
                                    TDS=0.56)
                except KeyError:
                    add = WaterData(datetime=datetime.now().strftime('%Y-%m-%d %H:%M:%S'), temperature=100.0, PH=5.9,
                                    DO=2.5, TDS=0.56)
                db.session.add(add)
                db.session.commit()
            time.sleep(5)


Async_getData().get_data_thread()  # 启动异步线程


@app.route('/query')
@cross_origin()
def query_data():
    res = query2dict(WaterData.query.all())
    res_convert = []
    for dic in res:
        dic['datetime'] = dic['datetime'].strftime('%Y-%m-%d %H:%M:%S')
        res_convert.append(dic)
    return res_convert[-1]


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=False)
