from basic import Japi, Method, JRequest, JException
import os,traceback
import stat
from datetime import datetime

@Japi(config={"method": Method.POST})
def get_dir_list(request: JRequest):
    try:
        body = request.get_json()
        directory = body["directory"]
        files, folders = list_files_folders_in_directory(directory)
        return {
            "directory_path": directory,
            "files": files,
            "folders": folders
        }

    except Exception as e:
        return {
            "status": "failed",
            "err": str(e),
            "traceback": traceback.format_exc()
        }

def list_files_folders_in_directory(directory_path):
    directory_path = '/mnt/efs/' + directory_path
    try:
        items = os.listdir(directory_path)
        files = []
        folders = []

        for item in items:
            item_path = os.path.join(directory_path, item)
            item_stat = os.stat(item_path)

            # Basic details
            modified_date = datetime.fromtimestamp(item_stat.st_mtime).strftime('%Y-%m-%d %H:%M:%S')
            can_read = os.access(item_path, os.R_OK)
            can_write = os.access(item_path, os.W_OK)
            
            # Other details
            file_permissions = stat.filemode(item_stat.st_mode)  # File permissions in rwx format
            owner = item_stat.st_uid  # User ID of owner
            group = item_stat.st_gid  # Group ID
            creation_date = datetime.fromtimestamp(item_stat.st_ctime).strftime('%Y-%m-%d %H:%M:%S')  # Creation time
            hard_links = item_stat.st_nlink  # Number of hard links
            is_symlink = os.path.islink(item_path)  # Check if it's a symbolic link

            if os.path.isfile(item_path):
                files.append({
                    "file_name": item,
                    "size": item_stat.st_size,  # File size in bytes
                    "modified_date": modified_date,
                    "can_read": can_read,
                    "can_write": can_write,
                    "other_info": {
                        "creation_date": creation_date,
                        "permissions": file_permissions,
                        "owner": owner,
                        "group": group,
                        "hard_links": hard_links,
                        "is_symlink": is_symlink
                    }
                })
            elif os.path.isdir(item_path):
                folders.append({
                    "folder_name": item,
                    "modified_date": modified_date,
                    "can_read": can_read,
                    "can_write": can_write,
                    "other_info": {
                        "creation_date": creation_date,
                        "permissions": file_permissions,
                        "owner": owner,
                        "group": group,
                        "hard_links": hard_links,
                        "is_symlink": is_symlink
                    }
                })

        return files, folders

    except Exception as e:
        return str(e)
