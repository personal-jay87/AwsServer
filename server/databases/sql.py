import sqlite3
import os
from typing import Dict, List, Optional, Tuple, Union


class Query:
    def __init__(self, dataBase: 'DataBase', table_name: str):
        self.dataBase = dataBase
        self.table_name = table_name
        self.columns = '*'
        self.values: Optional[Dict[str, Union[str, int]]] = None
        self.conditions: List[str] = []
        self.order_by: Optional[str] = None
        self.limit: Optional[str] = None
        self.offset: Optional[str] = None
        self.operation: Optional[str] = None

    def select(self, *columns: str) -> 'Query':
        self.columns = ', '.join(columns) if columns else '*'
        self.operation = 'SELECT'
        return self

    def insert(self, **values: Union[str, int]) -> 'Query':
        self.values = values
        self.operation = 'INSERT'
        return self

    def update(self, **values: Union[str, int]) -> 'Query':
        self.values = values
        self.operation = 'UPDATE'
        return self

    def delete(self) -> 'Query':
        self.operation = 'DELETE'
        return self

    def where(self, condition: str) -> 'Query':
        self.conditions.append(condition)
        return self

    def and_where(self, condition: str) -> 'Query':
        if self.conditions:
            self.conditions.append(f'AND {condition}')
        return self

    def or_where(self, condition: str) -> 'Query':
        if self.conditions:
            self.conditions.append(f'OR {condition}')
        return self

    def order_by(self, column: str, direction: str = 'ASC') -> 'Query':
        self.order_by = f'ORDER BY {column} {direction}'
        return self

    def limit(self, count: int) -> 'Query':
        self.limit = f'LIMIT {count}'
        return self

    def offset(self, count: int) -> 'Query':
        self.offset = f'OFFSET {count}'
        return self

    def build_select(self) -> str:
        query = f"SELECT {self.columns} FROM {self.table_name}"
        if self.conditions:
            query += " WHERE " + ' '.join(self.conditions)
        if self.order_by:
            query += " " + self.order_by
        if self.limit:
            query += " " + self.limit
        if self.offset:
            query += " " + self.offset
        return query

    def build_insert(self) -> str:
        columns = ', '.join(self.values.keys())
        placeholders = ', '.join('?' * len(self.values))
        return f"INSERT INTO {self.table_name} ({columns}) VALUES ({placeholders})"

    def build_update(self) -> str:
        set_clause = ', '.join(f"{key} = ?" for key in self.values.keys())
        query = f"UPDATE {self.table_name} SET {set_clause}"
        if self.conditions:
            query += " WHERE " + ' '.join(self.conditions)
        return query

    def build_delete(self) -> str:
        query = f"DELETE FROM {self.table_name}"
        if self.conditions:
            query += " WHERE " + ' '.join(self.conditions)
        return query

    def get_query(self) -> str:
        if self.operation == 'SELECT':
            return self.build_select()
        elif self.operation == 'INSERT':
            return self.build_insert()
        elif self.operation == 'UPDATE':
            return self.build_update()
        elif self.operation == 'DELETE':
            return self.build_delete()
        else:
            raise ValueError("No operation specified")

    def execute(self) -> Union[int, List[Tuple]]:
        query = self.get_query()
        params = tuple(self.values.values()) if self.values else ()
        return self.dataBase.Query_executer(query, params)


class DataBase:
    def __init__(self, dataBaseName: str) -> None:
        self.dataBaseName = dataBaseName
        self.rootPath = "/mnt/efs/database/"
        self.dataBasePath = os.path.join(self.rootPath, f"{self.dataBaseName}.db")

    def query(self, table_name: str) -> Query:
        return Query(self, table_name)
    
    def execute(self, query_string: str,params: str = None):
        if(params is not None):
            params = params.split(",")
        return self.Query_executer(query_string,params)

    def Query_executer(self, query_string: str, params: Tuple) -> Union[int, List[Tuple], str]:
        conn = sqlite3.connect(self.dataBasePath)
        cursor = conn.cursor()

        try:
            if(params is None):
                cursor.execute(query_string)
            else:
                cursor.execute(query_string, params)
                
            
            if query_string.strip().upper().startswith(('INSERT', 'UPDATE', 'DELETE', 'CREATE')):
                conn.commit()
            
            if query_string.strip().upper().startswith(('INSERT', 'UPDATE', 'DELETE')):
                return conn.total_changes
            
            elif query_string.strip().upper().startswith('SELECT'):
                return cursor.fetchall()
            
            elif query_string.strip().upper().startswith('CREATE'):
                return "Table created successfully"
        
        except sqlite3.Error as e:
            return f"An error occurred: {e}"
        
        finally:
            cursor.close()
            conn.close()