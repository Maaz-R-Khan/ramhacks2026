# ML Pipeline

Keep downloaded Kaggle files in `ml/raw/`. Do not edit those files directly.
Generated training inputs go in `ml/processed/`, and trained artifacts go in
`ml/models/`.

## Dataset Notes

- `multiclass_exercise_skeleton.csv` is the best first training dataset. It has
  2,700 rows, 7 classes, and 132 numeric MediaPipe pose landmark features.
- `exercise_angles.csv` is also usable. It has 31,033 rows and 5 classes, but
  only 10 numeric angle features plus side.
- `imagePoses.csv` includes base64 images and pose strings, with missing pose
  data in some rows. Use it later if you need more exercise categories.
- `workout.csv` is not a classification training dataset. It is metadata for
  workout recommendations.

## Recommended Baseline

Start with a Random Forest classifier on normalized MediaPipe landmarks. It is
fast, works well on tabular pose features, handles nonlinear relationships, and
is easier to debug than a neural network during the first pass.

After the baseline is working, compare against:

- Gradient boosting for better tabular accuracy.
- A small neural network if you need browser-side TensorFlow.js inference.
- Sequence models only if you classify full exercise motion over time instead of
  single-frame poses.

## Commands

Install ML dependencies:

```bash
python3 -m pip install -r ml/requirements.txt
```

Prepare the landmark dataset:

```bash
python3 ml/scripts/prepare_landmarks.py
```

Train the classifier:

```bash
python3 ml/scripts/train_classifier.py
```

The trained model is written to `ml/models/exercise_classifier.joblib`, and
metrics are written to `ml/models/exercise_classifier_report.json`.

## Form Correctness

The classifier above predicts a class. Correct-vs-incorrect form is a different
problem. For supervised learning, the dataset needs labels such as `correct` and
`incorrect` for each exercise.

Because `exercise_angles.csv` only contains exercise labels, the current baseline
assumes those rows are examples of acceptable form. It learns the normal angle
range for each exercise and marks incoming form as incorrect when the angles are
too far from that reference.

Train the form reference:

```bash
python3 ml/scripts/train_form_reference.py
```

Test one pose:

```bash
python3 ml/scripts/predict_form.py \
  --exercise "Squats" \
  --angles "90,170,80,95,90,90,90,90,90,90"
```

For production, compute the same 10 angles from live MediaPipe landmarks and
send those angles to the backend with the exercise name.
