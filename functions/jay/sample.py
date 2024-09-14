from basic import Japi,Method,JRequest,JException
import os

@Japi
def helo(request: JRequest):
    return os.getcwd()

@Japi(config = {"method":Method.POST})
def ok(request: JRequest):
    return {
        "isTest":"yes",
        "body":request.get_body(),
        "param":request.get_param(),
        "jbody":request.get_json()
    }
    
