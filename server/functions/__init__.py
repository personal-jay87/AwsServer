import os
import importlib

# __init__.py in all packages
# from os import import_modules,Load_All_APIs_At_Start
# if(Load_All_APIs_At_Start):
#     import_modules(__file__,__name__)

os.import_modules = {}
os.API_Dict = {}
if(os.Load_All_APIs_At_Start):
    def import_modules(_file_, _name_):
        root_path = os.path.abspath(_file_).replace("__init__.py", "")

        # Traverse all files and directories within the current root_path
        for dirpath, dirnames, filenames in os.walk(root_path):
            # Only consider Python files
            python_files = [f[:-3] for f in filenames if f.endswith('.py') and f != '__init__.py']

            # Build the module import path
            relative_path = os.path.relpath(dirpath, os.path.dirname(_file_)).replace(os.sep, ".")
            package_name = f"{_name_}.{relative_path.replace('.', '')}" if relative_path != "." else _name_

            # Import each module
            for module in python_files:
                importlib.import_module(f'{package_name}.{module}', package=_name_)

    os.import_modules = import_modules
    # Call import_modules for each package in functions
    root_path = os.path.abspath(__file__).replace("__init__.py", "")
    dirs = [d for d in os.listdir(root_path) if os.path.isdir(os.path.join(root_path, d)) and d != '__pycache__']

    for dir in dirs:
        importlib.import_module(f'functions.{dir}', package=__name__)
