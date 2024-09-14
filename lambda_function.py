import traceback
import functions
from basic import JRequest,JException
import json
import os

# print(os.API_Dict)

def getUrl(path):
    return "https://3py2admpd4.execute-api.ap-south-1.amazonaws.com/ServerApplication"+path

def generate_html(api_dict):
    with open("index.html", "r") as file:
        html_content = file.read()
    
    row_id = [0]  # List to hold the row ID, mutable object

    def traverse_api_dict(api_dict, parent_path=""):
        html_rows = ""
        for key, value in api_dict.items():
            current_path = f"{parent_path}/{key}".replace("//", "/")  # Avoid double slashes
            
            if "module_path" in value and "method" in value:
                config_viewer_id = f"config-viewer-{row_id[0]}"
                method_class = "get" if value["method"].name == "GET" else "post"
                if value['config']:
                    config_json = json.dumps(value['config'], indent=4)
                    config_html = f"<div class='config-cell'>View<span class='config-viewer' id='{config_viewer_id}'><pre>{config_json}</pre></span></div>"
                else:
                    config_html = "None"
                
                html_rows += f"""
                <tr class="api-row">
                    <td class="api-endpoint"><a href="{getUrl(current_path)}" target="_blank">{value['module_path']}</a></td>
                    <td class="{method_class}">{value['method'].name}</td>
                    <td>{config_html}</td>
                </tr>
                """
                row_id[0] += 1
            else:
                # Recursively traverse if it's a nested path
                html_rows += traverse_api_dict(value, current_path)
        return html_rows
    
    html_content = html_content.replace("<tbody id=\"apiTableBody\">", f"<tbody id=\"apiTableBody\">\n{traverse_api_dict(api_dict)}")
    return html_content


def apiDetails():
    html = generate_html(os.API_Dict)
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'text/html'
        },
        'body': html
    }


def isApiPathExist(root_path):
    URLEndPoint = ""
    temp = os.API_Dict
    for rp in root_path:
        URLEndPoint += "/" + rp
        if(rp in temp):
            temp = temp[rp]
        else:
            return False,URLEndPoint,None
    
    if("module_path" not in temp or "reference" not in temp or "method" not in temp):
        return False,URLEndPoint,None
    return True,URLEndPoint,temp

def lambda_handler(event, context):
    # Extract headers, body, and HTTP method from the event
    path = event.get('path', '/')
    headers = event.get('headers', {})
    body = event.get('body', b'')
    method = event.get('httpMethod', 'GET')  # or 'POST', 'PUT', etc.
    query_params = event.get('queryStringParameters', {})
    
    root_path = path.split("/")[1:]
    path = ("/".join(root_path))
    
    return run_api(method,path,headers,body,query_params)

def run_api(method: str,path: str,headers: dict,body,query_params: dict):
    if(path == "apiDetails"):
        return apiDetails()
    
    if(body != None and body != ""):
        try:
            body = json.loads(body)
        except:
            pass
        
    isExist,URLEndPoint,temp = isApiPathExist(path.split("/"))
    if(isExist):
        try:
            func = temp["reference"]
            if(temp["method"].name == method):
                try:
                    response = func(JRequest(
                        method = method,
                        path = path,
                        headers = headers,
                        body = body,
                        query_params = query_params
                    ))
                    
                    try:
                        response = json.dumps(response)
                    except:
                        pass
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json'
                        },
                        'body': str(response)
                    }
                except JException as e:
                    return {
                        'statusCode': e.StatusCode,
                        'headers': {
                            'Content-Type': 'application/json'
                        },
                        'body': json.dumps(e.Response)
                    }
                except Exception as e:
                    return {
                        'statusCode': 500,
                        'headers': {
                            'Content-Type': 'application/json'
                        },
                        'body': json.dumps({
                            "endpoint":URLEndPoint,
                            "message":"Error : "+str(e),
                            "traceback": traceback.format_exc()
                        })
                    }
            else:
                return {
                    'statusCode': 405,
                    'headers': {
                        'Content-Type': 'application/json'
                    },
                    'body': json.dumps({
                        "endpoint":URLEndPoint,
                        "message":"The API will only accept the ("+temp["method"].name+") method"
                    })
                }
        except Exception as e:
            return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json'
                    },
                    'body': json.dumps({
                        "endpoint":URLEndPoint,
                        "message":"Error : \""+str(e)+"\"",
                        "traceback": traceback.format_exc()
                    })
                }
    else:
        return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json'
                    },
                    'body': json.dumps({
                        "endpoint":URLEndPoint,
                        "message":"Endpoint Not Found"
                    })
                }


def isRunningOnLambda(): return "/var/task" == os.getcwd()
def isRunningOnLocal(): return not isRunningOnLambda()

os.isRunningOnLambda = isRunningOnLambda
os.isRunningOnLocal = isRunningOnLocal

# Check if /mnt/efs exists (if not, consider running locally)
if isRunningOnLocal():
    os.makedirs("/mnt/efs", exist_ok=True)
    import os, fastapi, uvicorn, typing
    app = fastapi.FastAPI()

    # Accept all HTTP methods
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
    async def dynamic_route(path: str, request: fastapi.Request):
        print(path)
        method = request.method
        body = (await request.body()).decode('utf-8') if method == 'POST' else ''
        headers: typing.Dict[str, str] = dict(request.headers)
        query_params: typing.Dict[str, str] = dict(request.query_params)
        
        
        root_path = path.split("/")[1:]
        path = ("/".join(root_path))
        
        # Call the external run_api function to handle the request
        response_content = run_api(method, path, headers, body, query_params)
        response_header = response_content.get("headers", {})
        response_code = response_content.get("statusCode", 200)
        response_body = response_content.get("body", '')

        # Return the response with appropriate status code and headers
        return fastapi.Response(content=response_body, headers=response_header, status_code=response_code)

    # Run the FastAPI app
    if __name__ == "__main__":
        uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
