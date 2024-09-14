import zipfile
import os
import subprocess



# Get the current working directory and specify the folder to zip
folder = os.getcwd().replace("\\","/")

folder2 = folder+"/package"

if os.path.exists(folder2) and os.path.isdir(folder2):
    os.rmdir(folder2)

subprocess.run(
    ['pip', 'install', '-r', 'requirements.txt', '-t', 'package/'],
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL
)


zip_filename = folder + '/lambda_function.zip'

if os.path.exists(zip_filename):
    os.remove(zip_filename)

# Print the folder being zipped and its contents for debugging
print("Zipping contents of:", zip_filename)

# Create the zip file
with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, _, files in os.walk(folder):
        for file in files:
            file_path = os.path.join(root, file)
            relative_path = os.path.relpath(file_path, folder)
            # print(f"Adding {file_path} as {relative_path} to the zip")
            if('lambda_function.zip' not in relative_path):
                zipf.write(file_path, relative_path)

print(f"Zip file {zip_filename} created successfully.")


# Uncomment this line to run the AWS CLI command and update the Lambda function
print("Updating Lambda function...")

# aws lambda create-function --function-name ServerAppTest --zip-file fileb://lambda_function.zip --handler app.lambda_handler --runtime python3.12 --role arn:aws:iam::321733618510:role/lambda_deploy
# aws lambda update-function-code --function-name ServerApp --zip-file fileb://lambda_function.zip
# pip install -r requirements.txt -t package/


subprocess.run(
    ['aws', 'lambda', 'update-function-code', '--function-name', 'Server', '--zip-file', f'fileb://{zip_filename}'],
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL
)

if os.path.exists(zip_filename):
    os.remove(zip_filename)

print("Lambda function updated.")

