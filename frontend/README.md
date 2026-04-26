# Formline Frontend

Formline is a browser-based AI fitness assistant for logging workouts, tracking progress, and getting live form feedback from camera-based pose detection.

This folder contains the React + Vite frontend used for the hackathon demo.

## Demo Pitch

Most workout apps record what you did, but not how you moved. Formline combines workout logging with live pose tracking so a user can train, count reps, save sets, and see their progress history in one flow.

## Features

- Firebase Authentication for user sign-in and account creation.
- Exercise picker with guided live training sessions.
- Browser camera pose tracking with `@mediapipe/tasks-vision`.
- Rep counting from joint-angle thresholds for supported exercises.
- WebSocket feedback from the FastAPI backend.
- Firestore Lite workout sync for logged sets.
- Dashboard history with weekly volume, muscle balance, recent sessions, and PR trends.
- Graceful sync/camera/model error states for demo reliability.

## Tech Stack

- React 19
- Vite
- React Router
- Firebase Auth
- Firestore Lite
- MediaPipe Tasks Vision
- FastAPI backend over WebSockets

## Demo Flow

1. Open the app and create or sign into an account.
2. Go to the dashboard.
3. Pick an exercise from the training flow.
4. Allow camera access and perform a supported movement.
5. Stop the set to log detected reps.
6. Open the data dashboard to see history update from Firestore.

## Routes

- `/` - landing page
- `/about` - project/about page
- `/login` - sign in and account creation
- `/dashboard` - main app hub
- `/dashboard/train` - exercise picker
- `/dashboard/train/:exerciseId` - live training session
- `/dashboard/data` - progress dashboard
- `/dashboard/profile` - profile/settings screen

## Environment Variables

The Vite config reads environment variables from the repository root `.env`.

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Firestore rules must allow signed-in users to access their own `users/{uid}/setLogs` documents. If syncing fails with `permission-denied`, publish the latest root `firestore.rules` in Firebase Console.

## Run Locally

Install frontend dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Run the backend from the repository root in another terminal if you want WebSocket feedback:

```bash
python3 start.py
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run test
```

`npm run test` uses Vitest for the Firestore/history data layer tests. If Vitest is not installed yet, run:

```bash
npm install -D vitest
```

## Known Demo Notes

- Camera tracking requires browser camera permission.
- The pose model loads from MediaPipe-hosted assets, so internet access is needed.
- Firestore sync requires a valid Firebase project and published security rules.
- If a browser extension blocks `firestore.googleapis.com`, workout history may not sync.
- WebSocket feedback expects the backend on `ws://localhost:8000/ws`.

## What's Next

- Improve form feedback with validated exercise-specific movement models.
- Add more exercises and more reliable rep-detection thresholds.
- Build program planning, goals, streaks, and recommendations.
- Deploy the frontend/backend with production Firebase rules and monitoring.
