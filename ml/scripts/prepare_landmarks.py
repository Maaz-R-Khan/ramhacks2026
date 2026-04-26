#!/usr/bin/env python3
import argparse
import csv
from pathlib import Path


LANDMARK_COUNT = 33


def read_rows(path):
    with path.open(newline="", encoding="utf-8") as file:
        yield from csv.DictReader(file)


def landmark_triplets(row):
    return [
        (
            float(row[f"x{i}"]),
            float(row[f"y{i}"]),
            float(row[f"z{i}"]),
            float(row[f"v{i}"]),
        )
        for i in range(1, LANDMARK_COUNT + 1)
    ]


def normalize_pose(row):
    points = landmark_triplets(row)

    # MediaPipe pose landmarks are 1-indexed in this CSV. Landmarks 24/25 are hips.
    left_hip = points[23]
    right_hip = points[24]
    mid_hip = (
        (left_hip[0] + right_hip[0]) / 2,
        (left_hip[1] + right_hip[1]) / 2,
        (left_hip[2] + right_hip[2]) / 2,
    )

    shoulder_width = abs(points[11][0] - points[12][0])
    hip_width = abs(left_hip[0] - right_hip[0])
    scale = max(shoulder_width, hip_width, 1e-6)

    features = []
    for x, y, z, visibility in points:
        features.extend(
            [
                (x - mid_hip[0]) / scale,
                (y - mid_hip[1]) / scale,
                (z - mid_hip[2]) / scale,
                visibility,
            ]
        )
    return features


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--input",
        default="ml/raw/multiclass_exercise_skeleton.csv",
        help="Raw MediaPipe landmark CSV.",
    )
    parser.add_argument(
        "--output",
        default="ml/processed/landmarks_normalized.csv",
        help="Cleaned landmark feature CSV.",
    )
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    feature_names = [
        f"{axis}{i}"
        for i in range(1, LANDMARK_COUNT + 1)
        for axis in ("x", "y", "z", "v")
    ]

    rows_written = 0
    with output_path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["class", *feature_names])

        for row in read_rows(input_path):
            writer.writerow([row["class"], *normalize_pose(row)])
            rows_written += 1

    print(f"Wrote {rows_written} rows to {output_path}")


if __name__ == "__main__":
    main()
