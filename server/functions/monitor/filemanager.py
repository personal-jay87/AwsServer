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


@Japi(config={"method": Method.POST})
def read_file(request: JRequest):
    try:
        body = request.get_json()
        file_path = '/mnt/efs' + body["file_path"]  # Ensure the file path is in the correct location

        # Check if the file exists
        if not os.path.isfile(file_path):
            raise JException(f"File {file_path} not found.")
        if not os.access(file_path, os.R_OK):
            raise JException(f"File {file_path} is not readable.")

        # Define human-readable extensions
        human_readable_extensions = ['.txt', '.csv', '.json', '.xml', '.md', '.log', '.html']

        # Get file extension
        _, file_extension = os.path.splitext(file_path)

        # Gather file metadata
        item_stat = os.stat(file_path)
        modified_date = datetime.fromtimestamp(item_stat.st_mtime).strftime('%Y-%m-%d %H:%M:%S')
        file_info = {
            "file_name": os.path.basename(file_path),
            "size": item_stat.st_size,  # File size in bytes
            "extension": file_extension,
            "modified_date": modified_date,
            "other_info": {
                "creation_date": datetime.fromtimestamp(item_stat.st_ctime).strftime('%Y-%m-%d %H:%M:%S'),
                "permissions": stat.filemode(item_stat.st_mode),
                "owner": item_stat.st_uid,
                "group": item_stat.st_gid,
                "hard_links": item_stat.st_nlink,
                "is_symlink": os.path.islink(file_path)
            }
        }

        # If the file is human-readable, return the content with info
        if file_extension in human_readable_extensions:
            with open(file_path, 'r', encoding="utf-8", errors='ignore') as file:
                content = file.read()

            return {
                "status": "success",
                "readable": True,
                "file_info": file_info,
                "content": content
            }
        else:
            # If the file is not human-readable, return file info only
            return {
                "status": "success",
                "readable": False,
                "file_info": file_info
            }

    except Exception as e:
        return {
            "status": "failed",
            "err": str(e),
            "traceback": traceback.format_exc()
        }


@Japi(config={"method": Method.POST})
def delete_file(request: JRequest):
    try:
        body = request.get_json()
        file_path = '/mnt/efs/' + body["file_path"]

        # Check if the file exists
        if not os.path.isfile(file_path):
            raise JException(f"File {file_path} not found.")
        if not os.access(file_path, os.W_OK):
            raise JException(f"File {file_path} is not writable or cannot be deleted.")

        # Delete the file
        os.remove(file_path)

        return {
            "status": "success",
            "message": f"File {body['file_path']} deleted successfully."
        }

    except Exception as e:
        return {
            "status": "failed",
            "err": str(e),
            "traceback": traceback.format_exc()
        }


@Japi(config={"method": Method.POST})
def rename_file(request: JRequest):
    try:
        body = request.get_json()
        old_file_path = '/mnt/efs' + body["old_file_path"]  # Old file path (e.g., "/folder/old_name.txt")
        new_file_path = '/mnt/efs' + body["new_file_path"]  # New file path with updated name (e.g., "/folder/new_name.txt")

        # Ensure both paths are within the same directory
        old_directory = os.path.dirname(old_file_path)
        new_directory = os.path.dirname(new_file_path)
        
        if old_directory != new_directory:
            raise JException("Both the old and new file paths must be in the same directory.")

        # Check if the old file exists
        if not os.path.isfile(old_file_path):
            raise JException(f"File {old_file_path} not found.")
        if not os.access(old_file_path, os.W_OK):
            raise JException(f"File {old_file_path} is not writable or cannot be renamed.")

        # Rename the file
        os.rename(old_file_path, new_file_path)

        return {
            "status": "success"
        }

    except Exception as e:
        return {
            "status": "failed",
            "err": str(e),
            "traceback": traceback.format_exc()
        }
