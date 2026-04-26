#!/usr/bin/env python3
import argparse
import csv
import json
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, StandardScaler


def load_dataset(path):
    with path.open(newline="", encoding="utf-8") as file:
        reader = csv.reader(file)
        header = next(reader)
        rows = list(reader)

    labels = np.array([row[0] for row in rows])
    features = np.array([[float(value) for value in row[1:]] for row in rows])
    return header[1:], features, labels


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--data",
        default="ml/processed/landmarks_normalized.csv",
        help="Prepared CSV where first column is the class label.",
    )
    parser.add_argument("--model-out", default="ml/models/exercise_classifier.joblib")
    parser.add_argument("--report-out", default="ml/models/exercise_classifier_report.json")
    parser.add_argument("--test-size", type=float, default=0.2)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    data_path = Path(args.data)
    model_path = Path(args.model_out)
    report_path = Path(args.report_out)
    model_path.parent.mkdir(parents=True, exist_ok=True)

    feature_names, features, labels = load_dataset(data_path)
    encoder = LabelEncoder()
    encoded_labels = encoder.fit_transform(labels)

    x_train, x_test, y_train, y_test = train_test_split(
        features,
        encoded_labels,
        test_size=args.test_size,
        random_state=args.seed,
        stratify=encoded_labels,
    )

    model = Pipeline(
        [
            ("scale", StandardScaler()),
            (
                "classifier",
                RandomForestClassifier(
                    n_estimators=300,
                    class_weight="balanced",
                    random_state=args.seed,
                    n_jobs=-1,
                ),
            ),
        ]
    )
    model.fit(x_train, y_train)

    predictions = model.predict(x_test)
    class_names = encoder.classes_.tolist()
    report = {
        "accuracy": accuracy_score(y_test, predictions),
        "classes": class_names,
        "feature_count": len(feature_names),
        "classification_report": classification_report(
            y_test,
            predictions,
            target_names=class_names,
            output_dict=True,
            zero_division=0,
        ),
        "confusion_matrix": confusion_matrix(y_test, predictions).tolist(),
    }

    joblib.dump(
        {
            "model": model,
            "label_encoder": encoder,
            "feature_names": feature_names,
        },
        model_path,
    )
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")

    print(f"Accuracy: {report['accuracy']:.4f}")
    print(f"Saved model to {model_path}")
    print(f"Saved report to {report_path}")


if __name__ == "__main__":
    main()
