# Frontline

Frontline is an AI-assisted exercise form checker and workout guidance prototype. It uses a React frontend, a FastAPI backend, browser camera input, MediaPipe pose landmarks, and a Python machine-learning pipeline to help users review movement quality while training.

The current frontend code still uses the product name "Formline" in several places. This README uses "Frontline" because that is the requested project name, but the UI copy should be renamed if Frontline is the final brand.

## Overview

Frontline is built around a simple idea: workout tracking is more useful when the app can also understand how the movement was performed. The project is moving toward a personal-trainer-like experience where a user can choose an exercise, use their laptop or phone camera, receive form feedback, and track training progress over time.

The repository is currently split between `main` and active feature branches. The sections below describe what is already in the repo and what is still prototype or planned work.

## Current Status

### On `main`

- React + Vite frontend with landing, about, and login routes.
- FastAPI backend with:
  - `GET /ping` health check.
  - `GET /{full_path:path}` static SPA fallback for a built frontend.
  - `/ws` WebSocket endpoint that currently echoes messages.
- `start.py` helper that starts the FastAPI backend and Vite frontend dev server together.

### In Feature Branches

| Branch | What it adds | Notes |
| --- | --- | --- |
| `origin/oscar` | Exercise library, exercise detail pages, live camera session page, MediaPipe pose overlay, and rep-count prototype. | Sends pose-derived angle data to the backend over WebSockets. Rep detection is threshold-based for supported exercises. |
| `origin/maaz` | Firebase Auth/Firestore setup, a MediaPipe pose landmarker helper, and an `ml/` folder with dataset notes and training scripts. | Firebase is scaffolded but not wired into a full auth flow. Some frontend helper files are placeholders. |
| `origin/mlmodel` | Oscar's exercise/session flow plus ML form-reference scoring in the backend. | Loads `ml/models/form_reference.json`, compares live angles against per-exercise reference ranges, and returns feedback messages over WebSockets. |

There is no remote branch named exactly `ml`; the ML work is currently on `origin/mlmodel`.

## Core Features

### Exercise Library

The exercise flow in the feature branches includes grouped exercises for chest, back, legs, shoulders, and core. Each exercise can include:

- Name and difficulty.
- Target joints.
- Step-by-step instructions.
- Key joint-angle targets.
- Common mistakes.
- Optional rep-detection thresholds.

Current exercise data includes push-ups, wide push-ups, pull-ups, chin-ups, squats, lunges, shoulder circles, arm circles, and planks.

### Live Form Session

The live session page uses the browser camera and `@mediapipe/tasks-vision` Pose Landmarker. The prototype:

- Requests camera access in the browser.
- Loads the MediaPipe pose model from Google's hosted model storage.
- Draws pose landmarks and connectors over the video feed.
- Computes body angles from detected landmarks.
- Sends angle data to the FastAPI backend over a WebSocket.
- Displays backend feedback in the session UI.

### Rep Detection Prototype

The `origin/oscar` branch includes threshold-based rep detection. For example, push-ups use elbow-angle thresholds to detect the active phase and completed rep. Squats and lunges use knee-angle thresholds. Static or mobility exercises such as planks and arm circles currently do not define rep detection.

### ML Form Reference Prototype

The `origin/mlmodel` branch includes a form-scoring prototype based on reference angle statistics:

- `ml/raw/exercise_angles.csv` contains angle rows labeled by exercise.
- `ml/scripts/train_form_reference.py` builds per-exercise mean and standard-deviation references.
- `ml/models/form_reference.json` stores the generated reference model.
- The backend scores incoming angles with z-scores.
- Feedback is currently mapped to broad cues such as elbow bend, knee bend, hip alignment, and shoulder position.

The prototype currently maps form scoring for push-ups, wide push-ups, pull-ups, chin-ups, and squats. It should be treated as an early baseline, not production-grade fitness or medical advice.

### Exercise Classification Pipeline

The ML folder also includes a baseline exercise classifier workflow:

- `ml/raw/multiclass_exercise_skeleton.csv` contains 2,700 rows across 7 classes with 132 MediaPipe pose landmark features.
- `ml/scripts/prepare_landmarks.py` prepares landmark data.
- `ml/scripts/train_classifier.py` trains a Random Forest classifier.
- Trained artifacts are written to `ml/models/`.

## Planned Features

These ideas appear in the project direction but are not fully implemented in `main` yet:

- Persistent user accounts.
- Workout history storage.
- Goal tracking.
- Dashboard and progress charts.
- Personal records.
- Video upload for form analysis.
- Production authentication and authorization.
- Deployed frontend/backend environment.
- More robust model validation and exercise coverage.

## Tech Stack

### Frontend

- React 19
- Vite 8
- React Router 7
- `@mediapipe/tasks-vision` in the feature branches

### Backend

- Python
- FastAPI
- Uvicorn
- WebSockets
- Static serving for the built frontend

### Machine Learning

- NumPy
- scikit-learn
- joblib
- MediaPipe landmark and angle features
- CSV-based training data

### Branch-Only Integrations

- Firebase Auth and Firestore scaffolding on `origin/maaz`

## Project Structure

```text
.
|-- backend/
|   `-- app.py
|-- frontend/
|   |-- package.json
|   |-- src/
|   |   |-- App.jsx
|   |   `-- pages/
|   `-- vite.config.js
|-- ml/                     # Present on ML feature branches
|   |-- README.md
|   |-- raw/
|   |-- models/
|   `-- scripts/
|-- requirements.txt
`-- start.py
```

## Routes

Routes currently on `main`:

- `/`
- `/about`
- `/login`

Additional routes in the exercise feature branches:

- `/exercises`
- `/exercises/:id`
- `/session/:id`

## Installation

Install Python dependencies from the repository root:

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Build the frontend before relying on the FastAPI static file server:

```bash
npm run build
cd ..
```

Run both development servers:

```bash
python3 start.py
```

The backend runs on `http://127.0.0.1:8000`. Vite will print the frontend dev URL, usually `http://localhost:5173`.

To run only the frontend:

```bash
cd frontend
npm run dev
```

To run only the backend after building the frontend:

```bash
cd backend
python3 -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

## ML Commands

The ML commands apply on the ML feature branches, especially `origin/mlmodel`.

Install ML dependencies:

```bash
python3 -m pip install -r ml/requirements.txt
```

Train the form reference model:

```bash
python3 ml/scripts/train_form_reference.py
```

Test form scoring for one pose:

```bash
python3 ml/scripts/predict_form.py \
  --exercise "Squats" \
  --angles "90,170,80,95,90,90,90,90,90,90"
```

Prepare the landmark classifier dataset:

```bash
python3 ml/scripts/prepare_landmarks.py
```

Train the exercise classifier:

```bash
python3 ml/scripts/train_classifier.py
```

## Development Notes

- The README separates `main` functionality from feature-branch functionality so the project description does not overstate what is merged.
- The form feedback model is a baseline that compares live angles against reference statistics. It needs validation before being treated as accurate coaching.
- The login page is currently UI-focused; production authentication is not complete on `main`.
- Workout tracking, goals, and progress insights are product goals, not completed features in the current `main` branch.
