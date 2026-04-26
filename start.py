"""Run the frontend (Vite) and backend (FastAPI/uvicorn) dev servers together.

Usage:
    python dev.py

Press Ctrl+C to stop both.

Backend runs on http://127.0.0.1:8000 (uvicorn --reload)
Frontend runs on whatever port Vite picks (default http://localhost:5173)
"""
import os
import signal
import subprocess
import sys
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "backend"
FRONTEND = ROOT / "frontend"
IS_WINDOWS = os.name == "nt"

procs = []


def pump(proc, label):
    for raw in iter(proc.stdout.readline, b""):
        line = raw.decode(errors="replace").rstrip()
        sys.stdout.write(f"[{label}] {line}\n")
        sys.stdout.flush()


def spawn(cmd, cwd, label):
    print(f"[dev] starting {label}: {cmd}  (cwd={cwd})")
    kwargs = {
        "cwd": str(cwd),
        "stdout": subprocess.PIPE,
        "stderr": subprocess.STDOUT,
        "shell": True,
        "bufsize": 1,
    }
    if IS_WINDOWS:
        kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
    else:
        kwargs["preexec_fn"] = os.setsid
    p = subprocess.Popen(cmd, **kwargs)
    procs.append((p, label))
    threading.Thread(target=pump, args=(p, label), daemon=True).start()
    return p


def shutdown():
    print("\n[dev] shutting down...")
    for p, label in procs:
        if p.poll() is not None:
            continue
        try:
            if IS_WINDOWS:
                p.send_signal(signal.CTRL_BREAK_EVENT)
            else:
                os.killpg(os.getpgid(p.pid), signal.SIGTERM)
        except Exception as e:
            print(f"[dev] failed to signal {label}: {e}")
            p.terminate()
    for p, label in procs:
        try:
            p.wait(timeout=5)
        except subprocess.TimeoutExpired:
            print(f"[dev] {label} did not exit cleanly, killing")
            p.kill()


def main():
    if not BACKEND.is_dir() or not FRONTEND.is_dir():
        sys.exit(f"[dev] expected backend/ and frontend/ next to {Path(__file__).name}")

    py = sys.executable
    py_q = f'"{py}"' if " " in py else py

    backend_cmd = f'{py_q} -m uvicorn app:app --reload --host 127.0.0.1 --port 8000'
    frontend_cmd = "npm run dev"

    spawn(backend_cmd, BACKEND, "backend")
    spawn(frontend_cmd, FRONTEND, "frontend")

    try:
        while True:
            time.sleep(0.5)
            for p, label in procs:
                rc = p.poll()
                if rc is not None:
                    print(f"[dev] {label} exited with code {rc}; stopping the other.")
                    return
    except KeyboardInterrupt:
        pass
    finally:
        shutdown()


if __name__ == "__main__":
    main()
