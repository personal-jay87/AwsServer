from basic import Japi,Method,JRequest,JException
import database.sql as sql

@Japi(config = {"method":Method.POST})
def execute_query(request: JRequest):
    try:
        body = request.get_json()
        query = body["query"]
        result = sql.execute_query("sample1",query)
        return {
            "status":"done",
            "results":result
        }
    except Exception as e:
        return {
            "status":"failed",
            "err":str(e)
        }