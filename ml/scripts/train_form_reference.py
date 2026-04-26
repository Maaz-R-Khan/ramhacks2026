#!/usr/bin/env python3
import argparse
import csv
import json
from collections import defaultdict
from pathlib import Path

import numpy as np


ANGLE_COLUMNS = [
    "Shoulder_Angle",
    "Elbow_Angle",
    "Hip_Angle",
    "Knee_Angle",
    "Ankle_Angle",
    "Shoulder_Ground_Angle",
    "Elbow_Ground_Angle",
    "Hip_Ground_Angle",
    "Knee_Ground_Angle",
    "Ankle_Ground_Angle",
]


def load_angle_rows(path):
    groups = defaultdict(list)
    with path.open(newline="", encoding="utf-8") as file:
        for row in csv.DictReader(file):
            label = row["Label"]
            features = [float(row[column]) for column in ANGLE_COLUMNS]
            groups[label].append(features)
    return groups


def build_reference(groups):
    references = {}
    for label, rows in groups.items():
        values = np.array(rows, dtype=float)
        references[label] = {
            "count": len(rows),
            "mean": values.mean(axis=0).tolist(),
            "std": np.maximum(values.std(axis=0), 1e-6).tolist(),
        }
    return references


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="ml/raw/exercise_angles.csv")
    parser.add_argument("--output", default="ml/models/form_reference.json")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    references = build_reference(load_angle_rows(input_path))
    payload = {
        "feature_names": ANGLE_COLUMNS,
        "method": "per_exercise_angle_z_score",
        "references": references,
    }
    output_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    print(f"Saved form reference for {len(references)} exercises to {output_path}")
    for label, stats in sorted(references.items()):
        print(f"{label}: {stats['count']} rows")


if __name__ == "__main__":
    main()
