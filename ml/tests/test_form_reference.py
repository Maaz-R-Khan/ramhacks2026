import json
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "ml" / "scripts"))

from predict_form import score_form
from train_form_reference import ANGLE_COLUMNS, build_reference


class FormReferenceTests(unittest.TestCase):
    def setUp(self):
        self.reference = {
            "feature_names": ANGLE_COLUMNS,
            "references": {
                "Squats": {
                    "count": 3,
                    "mean": [100.0] * len(ANGLE_COLUMNS),
                    "std": [10.0] * len(ANGLE_COLUMNS),
                }
            },
        }

    def test_pose_near_reference_is_correct(self):
        result = score_form(self.reference, "Squats", [105.0] * len(ANGLE_COLUMNS))

        self.assertTrue(result["is_correct"])
        self.assertEqual(result["exercise"], "Squats")
        self.assertEqual(result["worst_feature"], "Shoulder_Angle")

    def test_pose_far_from_reference_is_incorrect(self):
        result = score_form(
            self.reference,
            "Squats",
            [100.0, 100.0, 100.0, 180.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0],
        )

        self.assertFalse(result["is_correct"])
        self.assertEqual(result["worst_feature"], "Knee_Angle")

    def test_unknown_exercise_fails_with_choices(self):
        with self.assertRaisesRegex(ValueError, "Unknown exercise 'Push Ups'"):
            score_form(self.reference, "Push Ups", [100.0] * len(ANGLE_COLUMNS))

    def test_wrong_angle_count_fails_before_scoring(self):
        with self.assertRaisesRegex(ValueError, "Expected 10 angles"):
            score_form(self.reference, "Squats", [100.0, 100.0])

    def test_build_reference_records_count_mean_and_std(self):
        references = build_reference(
            {
                "Squats": [
                    [90.0] * len(ANGLE_COLUMNS),
                    [110.0] * len(ANGLE_COLUMNS),
                ]
            }
        )

        self.assertEqual(references["Squats"]["count"], 2)
        self.assertEqual(references["Squats"]["mean"], [100.0] * len(ANGLE_COLUMNS))
        self.assertEqual(references["Squats"]["std"], [10.0] * len(ANGLE_COLUMNS))


class GeneratedReferenceArtifactTests(unittest.TestCase):
    def test_generated_reference_has_expected_shape(self):
        reference_path = ROOT / "ml" / "models" / "form_reference.json"
        self.assertTrue(
            reference_path.exists(),
            "Run `python3 ml/scripts/train_form_reference.py` before testing the artifact.",
        )

        reference = json.loads(reference_path.read_text(encoding="utf-8"))

        self.assertEqual(reference["feature_names"], ANGLE_COLUMNS)
        self.assertIn("Squats", reference["references"])
        for exercise, stats in reference["references"].items():
            with self.subTest(exercise=exercise):
                self.assertGreater(stats["count"], 0)
                self.assertEqual(len(stats["mean"]), len(ANGLE_COLUMNS))
                self.assertEqual(len(stats["std"]), len(ANGLE_COLUMNS))
                self.assertTrue(all(value > 0 for value in stats["std"]))


if __name__ == "__main__":
    unittest.main()
