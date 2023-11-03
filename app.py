from asyncio import sleep
from werkzeug.utils import secure_filename
from flask import render_template, Response, request
from flask_socketio import SocketIO
from flask import Flask
from azure.storage.blob import BlobServiceClient, BlobClient
from dotenv import load_dotenv

import os

load_dotenv()

AZURE_BLOB_URL = os.getenv("AZURE_BLOB_URL")
AZURE_CREDENTIAL_KEY = os.getenv("AZURE_CREDENTIAL_KEY")
AZURE_CONTAINER_NAME = os.getenv("AZURE_CONTAINER_NAME")

blob_service_client = BlobServiceClient(AZURE_BLOB_URL, credential=AZURE_CREDENTIAL_KEY)
container_client = blob_service_client.get_container_client(container=AZURE_CONTAINER_NAME)

chunk_size=4*1024*1024 


app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv("FLASK_SECRET")

socketio = SocketIO(app, async_mode='threading')

@app.route("/", methods = ["GET", "POST"])
def home():
    return render_template("index.html")

@app.route("/progress/<socketid>", methods = ["POST"])
async def progress(socketid):
    file = request.files['file']

    if file:

        filesize = file.seek(0, os.SEEK_END)
        progress_total = filesize // chunk_size + 1

        file.stream.seek(0)

        blob_client = container_client.get_blob_client(file.filename)
        
        if (blob_client.exists()):
            blob_client.delete_blob()
                
        blob_client.create_append_blob()

        i = 0
        while True:
            read_data = file.read(chunk_size)
            
            if not read_data:
                print(f'{file.filename} Done!')
                return Response(status=204)
            blob_client.append_block(read_data)
            i+=1
            socketio.emit("update progress", round(i/progress_total*100), to=socketid)
            print(i)

    return Response(status=500)


if __name__ == "__main__":
    socketio.run(app=app, debug=True, host="0.0.0.0", port = 25565)
