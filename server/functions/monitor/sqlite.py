import os,json
import databases.sql as sql
from basic import Japi,Method,JRequest,JResponse,JException,getBaseUrl

mySampleDb = sql.DataBase("sample1")


def generate_html():
    with open("html/sqlDetails.html", "r") as file:
        html_content = file.read()
    
    return html_content


@Japi
def details(request: JRequest):
    html_page = generate_html()
    return JResponse(200,"html",html_page)

