from basic import Japi,Method,JRequest,JException
import os

@Japi(config = {"method":Method.POST})
def write(request: JRequest):
    try:
        body = request.get_json()
        txt = body["text"]
        with open("/mnt/efs/sample.txt","w") as f:
            f.write(txt)
        return {
            "status":"done"
        }
    except Exception as e:
        return {
            "status":"failed",
            "err":str(e)
        }



@Japi(config = {"method":Method.GET})
def read(request: JRequest):
    try:
        with open("/mnt/efs/sample.txt","r") as f:
            txt = f.read()
        return {
            "status":"done",
            "text":txt
        }
    except Exception as e:
        return {
            "status":"failed",
            "err":str(e)
        }


def list_files_in_directory(directory_path='/mnt/efs'):
    try:
        # List all files and directories
        files = os.listdir(directory_path)
        return files
    except Exception as e:
        return str(e)

@Japi(config = {"method":Method.GET})
def list_dir(request: JRequest):
    try:
        files = list_files_in_directory()
        return {
            "status":"done",
            "Files":files
        }
    except Exception as e:
        return {
            "status":"failed",
            "err":str(e)
        }