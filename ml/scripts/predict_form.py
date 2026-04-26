#!/usr/bin/env python3
import argparse
import json
from pathlib import Path

import numpy as np


def score_form(reference, exercise, angles):
    if exercise not in reference["references"]:
        choices = ", ".join(sorted(reference["references"]))
        raise ValueError(f"Unknown exercise '{exercise}'. Choices: {choices}")

    stats = reference["references"][exercise]
    mean = np.array(stats["mean"], dtype=float)
    std = np.array(stats["std"], dtype=float)
    values = np.array(angles, dtype=float)

    z_scores = np.abs((values - mean) / std)
    worst_index = int(np.argmax(z_scores))
    average_score = float(np.mean(z_scores))
    worst_score = float(z_scores[worst_index])

    return {
        "exercise": exercise,
        "is_correct": average_score <= 2.0 and worst_score <= 3.5,
        "average_z_score": average_score,
        "worst_z_score": worst_score,
        "worst_feature": reference["feature_names"][worst_index],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--reference", default="ml/models/form_reference.json")
    parser.add_argument("--exercise", required=True)
    parser.add_argument(
        "--angles",
        required=True,
        help="Comma-separated angles in the same order as form_reference.json feature_names.",
    )
    args = parser.parse_args()

    reference = json.loads(Path(args.reference).read_text(encoding="utf-8"))
    angles = [float(value.strip()) for value in args.angles.split(",")]

    if len(angles) != len(reference["feature_names"]):
        raise ValueError(
            f"Expected {len(reference['feature_names'])} angles: "
            f"{', '.join(reference['feature_names'])}"
        )

    print(json.dumps(score_form(reference, args.exercise, angles), indent=2))


if __name__ == "__main__":
    main()
