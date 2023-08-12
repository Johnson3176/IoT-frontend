@app.route('/AllControl',methods=['POST'])
@cross_origin()
def control_switch():
    url = r"https://59a6084cfa.st1.iotda-app.cn-north-4.myhuaweicloud.com:443/v5/iot/35bacf8d0d634b3f8a70fc9b5286d79d/devices/63dcdaa2352830580e47364e_2023_3_25/commands"
    Headers = {
        "X-Auth-Token": token_jxy,
        'Content-Type': 'application/json'}
    Body = {
        "service_id": "All_Control_System",
        "command_name": f"All_Control",
        "paras": {
            "Control_Flags": request.get_json()
        }
    }
    # print(request.get_data())  # 二进制字节流
    command = requests.post(url=url, json=Body, headers=Headers)
    res = command.status_code
    return str(res)