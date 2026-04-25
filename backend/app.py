# app.py
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

BASE_DIR = Path(__file__).parent
DIST_DIR = BASE_DIR / "../frontend/dist"

app = FastAPI()

@app.get("/ping")
def ping():
    return {"status": "ok"}

app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="assets")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    return FileResponse(DIST_DIR / "index.html")