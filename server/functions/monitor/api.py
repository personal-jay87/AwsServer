import os,json
from basic import Japi,Method,JRequest,JResponse,JException,getBaseUrl


def generate_html(api_dict):
    with open("html/apiDetails.html", "r") as file:
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
                    <td class="api-endpoint"><a href="{getBaseUrl(current_path)}" target="_blank">{value['module_path']}</a></td>
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


@Japi
def details(request: JRequest):
    html_page = generate_html(os.API_Dict)
    return JResponse(200,"html",html_page)