from basic import Japi,Method,JRequest,JException
import databases.sql as sql
import traceback

mySampleDb = sql.DataBase("sample1")


@Japi(config = {"method":Method.POST})
def execute_query(request: JRequest):
    try:
        body = request.get_json()
        query = body["query"]
        if("|" in query):
            query = query.split("|")
            result = mySampleDb.execute(query[0],query[1])
        else:
            result = mySampleDb.execute(query)
        return {
            "status":"done",
            "results":result
        }
    except Exception as e:
        return {
            "status":"failed",
            "err":str(e),
            "traceback": traceback.format_exc()
        }