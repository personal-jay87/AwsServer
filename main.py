# pip install fastapi uvicorn pydantic


import subprocess
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

app = FastAPI()

class Command(BaseModel):
    command: str

def run_command(command: str) -> str:
    try:
        # Run the command
        result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Command failed with error: {e.stderr.strip()}")

@app.post("/execute")
async def execute_command(cmd: Command):
    output = run_command(cmd.command)
    return {"output": output}

# Start the FastAPI application
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
