import inspect,os,json
from enum import Enum
from functools import reduce


class JException(Exception):
    def __init__(self, message, statusCode = None) -> None:
        super().__init__(message)
        self.StatusCode = statusCode or 200
        self.Response = { "message": str(self)}

class Method(Enum):
    POST = 1
    GET = 2
    
    def __repr__(self):
        return f"<Method {self.name}>"

    
methods = [meth for meth in Method]



class JRequest:
    def __init__(self, method='GET', path='/', headers=None,query_params = {}, body=''):
        self.method = method
        self.path = path
        self.headers = headers or {}
        self.query_params = query_params or {}
        self.body = body
        self._json = None

    def __repr__(self):
        return f"<JRequest method={self.method} path={self.path}>"
    
    def get_header(self, name):
        return self.headers.get(name)

    def get_param(self):
        return self.query_params

    def get_body(self):
        return self.body

    def get_json(self):
        if self._json is None:
            content_type = self.get_header('Content-Type')
            if content_type and 'application/json' in content_type:
                if isinstance(self.body, (str, bytes)):
                    try:
                        self._json = json.loads(self.body)
                    except json.JSONDecodeError:
                        self._json = {}
                else:
                    # Handle case where self.body is already a dictionary
                    self._json = self.body
        return self._json


    def get_text(self):
        try:
            return self.body.decode('utf-8')
        except AttributeError:
            # body is already a string
            return self.body


def Japi(func=None, *, config=None):
    def decorator(func):
        # Get the path of the module containing the function
        module_path = inspect.getfile(inspect.getmodule(func))
        module_path = module_path.replace("\\", "/").split("/")
        module_path = module_path[module_path.index("functions")+1:]
        module_path[-1] = module_path[-1][:-3]
        module_path.append(func.__name__)

        # Populate the nested dictionary
        
        # Add the final item
        method = Method.GET
        if config is not None and "method" in config:
            method = config["method"]
            del config['method']
        
        if method not in methods:
            raise Exception("Invalid API Method. It only can be = " + str(methods))
        
        reduce(lambda d, k: d.setdefault(k, {}), module_path[:-1], os.API_Dict)[module_path[-1]] = {
            "module_path": "/".join(module_path),
            "reference": func,
            "method": method,
            "config": config
        }

        return func

    if func is None:
        return decorator
    else:
        return decorator(func)
