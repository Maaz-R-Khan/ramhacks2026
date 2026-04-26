# Formline

## Inspiration

We built Formline because workout tracking usually stops at numbers: sets, reps, and weight. That data matters, but it does not tell someone whether they moved well, stayed consistent, or trained in a balanced way.

Our inspiration was a personal trainer experience that could live inside a browser. We wanted an app that helps users log their training while also using the camera to understand form, count reps, and turn each session into useful progress data.

## What it does

Formline is an AI-assisted fitness tracker and form feedback prototype. A user can create an account, choose an exercise, start a live training session, and use their camera while they work out.

During a session, Formline uses pose landmarks to track movement, count reps for supported exercises, and display feedback from the backend over a WebSocket connection. When a set is completed, the app saves the set to Firestore under the signed-in user. The dashboard then loads that history to show weekly volume, recent sessions, muscle balance, and personal record trends.

## How we built it

The frontend is built with React, Vite, and React Router. Firebase Authentication handles sign-in, and Firestore Lite stores workout history for each user.

The live form experience uses `@mediapipe/tasks-vision` in the browser to load a pose landmarker model, read camera frames, draw pose landmarks, calculate joint angles, and count reps from exercise-specific thresholds. The backend is a FastAPI app with a WebSocket endpoint that receives rep and frame events and sends feedback messages back to the session UI.

For the dashboard, we built a small data layer that saves set logs, updates edited sets, loads recent history, and transforms those logs into chart-ready training summaries.

## Challenges we ran into

One of the biggest issues was getting persistent history working reliably. We ran into browser-blocked Firestore WebChannel requests, so we switched the database layer to Firestore Lite because the app only needs one-shot reads and writes right now.

We also hit Firestore permission errors while syncing sets. The app was working locally, but the live Firestore rules were still blocking all reads and writes. Updating the deployed rules to allow signed-in users to access their own `/users/{uid}/setLogs` fixed that path.

The computer-vision side also had its own challenges. Camera permissions, model loading, WebSocket connection timing, and noisy pose landmarks all needed defensive handling so the workout screen could fail gracefully instead of breaking the session.

## Accomplishments that we're proud of

We are proud that Formline connects several moving parts into one usable flow: authentication, live camera tracking, rep counting, set logging, and a history dashboard.

We are also proud of the user-owned data model. Each user gets their own Firestore history, and the dashboard is no longer static mock data; it reflects sets the user actually logged.

Another accomplishment is making the app resilient. If camera tracking fails, the session can still show a clear error. If syncing fails, the set is still logged locally in the UI and the app reports a useful Firebase error instead of hiding the cause.

## What we learned

We learned that real-time browser ML is powerful but fragile. It is not enough to detect landmarks; the app also has to handle model loading, camera access, frame timing, cleanup, and imperfect rep-detection thresholds.

We also learned how important Firebase rules are. A frontend can have the correct project configuration and still fail if the deployed security rules do not match the data structure.

Finally, we learned that choosing the right SDK matters. Firestore Lite was a better fit for this project than the full Firestore SDK because Formline currently uses simple reads and writes, not realtime listeners or offline persistence.

## What's next for Formline

Next, we want to improve the quality of form feedback beyond basic threshold checks. That means collecting more movement examples, validating the angle targets for each exercise, and making feedback more specific to the user's movement.

We also want to add richer workout planning: goals, streaks, programs, recommendations, and better progress insights over time. On the training side, we want to support more exercises, improve rep counting, and make the session flow work well on both laptops and phones.

Before treating Formline as production-ready, we would also harden authentication, rules deployment, environment setup, error reporting, and backend deployment so the app is easier to run and more reliable outside a local demo.
