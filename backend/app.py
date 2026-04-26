# app.py
import json
from pathlib import Path
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

BASE_DIR = Path(__file__).parent
DIST_DIR = BASE_DIR / "../frontend/dist"

app = FastAPI()

app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="assets")

@app.get("/ping")
def ping():
    return {"status": "ok"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw)

            if msg["type"] == "rep":
                # placeholder: LLM feedback goes here
                await websocket.send_text(json.dumps({
                    "type": "feedback",
                    "message": f"Rep {msg['rep']} done — good work!",
                }))

            elif msg["type"] == "frame":
                # placeholder: check form angles and send correction if needed
                pass

    except WebSocketDisconnect:
        pass

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    return FileResponse(DIST_DIR / "index.html")
