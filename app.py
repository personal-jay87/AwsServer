import traceback
import functions
from basic import JRequest,JException
import json
import os

print(os.API_Dict)

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


def lambda_handler(event, context):
    # Extract headers, body, and HTTP method from the event
    path = event.get('path', '/')
    if(path == "/apiDetails"):
        return apiDetails()
    
    headers = event.get('headers', {})
    body = event.get('body', b'')
    
    if(body != None and body != ""):
        try:
            body = json.loads(body)
        except:
            pass
    method = event.get('httpMethod', 'GET')  # or 'POST', 'PUT', etc.
    query_params = event.get('queryStringParameters', {})
    
    root_path = path.split("/")[1:]

    isExist = True
    temp = os.API_Dict    
    URLEndPoint = ""
    for rp in root_path:
        URLEndPoint += "/" + rp
        if(rp in temp):
            temp = temp[rp]
        else:
            isExist = False
            break
    
    if("module_path" not in temp or "reference" not in temp or "method" not in temp):
        isExist = False
    
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
    