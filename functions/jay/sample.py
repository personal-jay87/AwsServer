from basic import Japi,Method,JRequest,JException

@Japi
def helo(request: JRequest):
    return "hi"

@Japi(config = {"method":Method.POST})
def ok(request: JRequest):
    return {
        "isTest":"yes",
        "body":request.get_body(),
        "param":request.get_param(),
        "jbody":request.get_json()
    }