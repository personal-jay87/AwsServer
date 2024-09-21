from basic import Japi,Method,JRequest,JException
import databases.sqlite as sqlite
import traceback

@Japi(config = {"method":Method.POST})
def select_view(request: JRequest):
    try:
        {
            "database":"exact path / relative path",
            "table_name":"table's name",
            "index_from":"start",
            "index_to":"end"
        }
        
        body = request.get_json()
        if("table_name" not in body):
            return {
                "status":"failed",
                "message":"table_name required"
            }
        
        if("database" in body and body["database"] != "" and body["database"][0] == "/"):
            is_path_exact = True
        else:
            is_path_exact = False
        
        database = sqlite.DataBase(body["database"],is_path_exact)
        table_name = body["table_name"]
        index_from = int(body["index_from"])
        index_to = int(body["index_to"])

        query = database.query(table_name).select('*')
        query.setLimit(index_to-index_from).setOffset(index_from)
        
        result = query.execute()
        return {
            "status":"success",
            "rows":result
        }
    except Exception as e:
        return {
            "status":"failed",
            "err":str(e),
            "traceback": traceback.format_exc()
        }

@Japi(config = {"method":Method.POST})
def get_db_info(request: JRequest):
    try:
        body = request.get_json()
        
        if("database" in body and body["database"] != "" and body["database"][0] == "/"):
            is_path_exact = True
        else:
            is_path_exact = False
            
        database = sqlite.DataBase(body["database"],is_path_exact)
        tables = database.execute("SELECT name FROM sqlite_master WHERE type='table';")
        resp_tables = []
        for table in tables:
            resp_table = {}

            table_name = table[0]
            resp_table["Name"] = table_name
            
            # Get the schema (columns) for each table
            columns = database.execute(f"PRAGMA table_info({table_name});")

            # The column details
            resp_table_columns = []
            for column in columns:
                temp = {
                    "ColumnID": column[0],
                    "Name": column[1],
                    "Type": column[2],
                    "NotNull": column[3],
                    "DefaultValue": column[4],
                    "PrimaryKey": column[5]
                }
                resp_table_columns.append(temp)
            resp_table["Columns"] = resp_table_columns
            resp_tables.append(resp_table)
        return {
            "status":"success",
            "tables":resp_tables
        }
    except Exception as e:
        return {
            "status":"failed",
            "err":str(e),
            "traceback": traceback.format_exc()
        }


@Japi(config = {"method":Method.POST})
def execute_query(request: JRequest):
    try:
        body = request.get_json()
        database = sqlite.DataBase(body["database"])
        query = body["query"]
        
        if("|" in query):
            query = query.split("|")
            result = database.execute(query[0],query[1])
        else:
            result = database.execute(query)
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
        
        