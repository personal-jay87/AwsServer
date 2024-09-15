import traceback
import functions
from basic import *
import json
import os

# print(os.API_Dict)
os.makedirs("/mnt/efs/database", exist_ok=True)


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
    # Handle OPTIONS requests for CORS
    if method == "OPTIONS":
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',  # Allow all origins
                'Access-Control-Allow-Methods': 'OPTIONS, GET, POST, PUT, DELETE',  # List of allowed methods
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',  # Allowed headers
                'Access-Control-Allow-Credentials': 'true'
            },
            'body': json.dumps({
                "message": "CORS pre-flight"
            })
        }
        
    # if(path == "apiDetails"):
    #     return apiDetails()
    
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
                    
                    if(isinstance(response, JResponse)):
                        return response.getResponse()
                    else:
                        try:
                            response = json.dumps(response)
                        except:
                            pass
                        
                        return {
                            'statusCode': 200,
                            'headers': {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*',  # Allow all origins
                            },
                            'body': str(response)
                        }
                except JException as e:
                    return {
                        'statusCode': e.StatusCode,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',  # Allow all origins
                        },
                        'body': json.dumps(e.Response)
                    }
                except Exception as e:
                    return {
                        'statusCode': 500,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',  # Allow all origins
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
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',  # Allow all origins
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
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',  # Allow all origins
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
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',  # Allow all origins
                    },
                    'body': json.dumps({
                        "endpoint":URLEndPoint,
                        "message":"Endpoint Not Found"
                    })
                }



# Check if /mnt/efs exists (if not, consider running locally)
if isRunningOnLocal():
    import os, fastapi, uvicorn, typing
    app = fastapi.FastAPI()
    from fastapi.middleware.cors import CORSMiddleware
    
    # Allow all origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allows all origins
        allow_credentials=True,
        allow_methods=["*"],  # Allows all methods
        allow_headers=["*"],  # Allows all headers
    )

    # Accept all HTTP methods
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
    async def dynamic_route(path: str, request: fastapi.Request):
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
        local_ip = "localhost"
        local_port = 8000
        os.BaseFunctionUrl = f"http://{local_ip}:{local_port}"
        uvicorn.run(app, host=local_ip, port=local_port, log_level="info")
