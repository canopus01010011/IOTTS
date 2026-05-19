import sys
import argparse
from dataclasses import dataclass

import cv2
import torch
from PIL import Image
from transformers import CLIPProcessor, CLIPModel

# PyTorch optimizations for Railway
torch.set_num_threads(1)
torch.set_grad_enabled(False)

DEFAULT_IMAGE_PATH = r"C:\Users\Informatics\Pictures\Camera Roll\IMG_20251202_233351.jpg"

# Quality thresholds
BLUR_BLURRY_THRESHOLD = 200
BLUR_SLIGHT_THRESHOLD = 400
BRIGHTNESS_DARK_THRESHOLD = 50
BRIGHTNESS_BRIGHT_THRESHOLD = 180

# CLIP
EQUIPMENT_SCORE_THRESHOLD = 0.5
CLIP_MODEL_NAME = "openai/clip-vit-base-patch32"

EQUIPMENT_LABELS = [
    "a photo of network equipment such as a router, switch, or modem",
    "a photo of a wifi router with antennas",
    "a photo of a network switch or patch panel",
    "a photo of a server rack or datacenter equipment",
    "a photo of a fiber optic splice box or distribution box",
    "a photo of a network cabinet or equipment enclosure",
    "a photo of a UPS or power supply unit for network equipment",
    "a photo of outdoor telecom equipment mounted on a pole or mast",
    "a photo of a base transceiver station or BTS equipment",
    "a photo of radio units or remote radio heads mounted on a tower",
    "a photo of a telecom equipment cabinet or outdoor enclosure",
    "a photo of fiber optic cables and connectors",
    "a photo of a satellite dish or microwave antenna",
    "a photo of a cellular antenna or sector antenna on a rooftop",
    "a photo of a power amplifier or signal booster for telecom",
    "a photo of coaxial cables and telecom wiring",
    "a photo of a junction box or cable distribution point",
    "a photo of telecom infrastructure on a rooftop"
]

NON_EQUIPMENT_LABEL = "a photo of something unrelated to networking"


@dataclass
class QualityReport:
    laplacian_var: float
    brightness: float

    @property
    def blur_label(self) -> str:
        if self.laplacian_var < BLUR_BLURRY_THRESHOLD:
            return "Blurry"

        if self.laplacian_var < BLUR_SLIGHT_THRESHOLD:
            return "Slightly Blurry"

        return "Sharp"

    @property
    def brightness_label(self) -> str:
        if self.brightness < BRIGHTNESS_DARK_THRESHOLD:
            return "Too Dark"

        if self.brightness > BRIGHTNESS_BRIGHT_THRESHOLD:
            return "Too Bright"

        return "Good"

    def print_summary(self) -> None:
        print(f"  Blur:       {self.laplacian_var:.2f} → {self.blur_label}")
        print(f"  Brightness: {self.brightness:.2f} → {self.brightness_label}")

    def to_dict(self) -> dict:
        return {
            "laplacian_var": self.laplacian_var,
            "brightness": self.brightness,
            "blur_label": self.blur_label,
            "brightness_label": self.brightness_label,
        }


@dataclass
class DetectionResult:
    accepted: bool
    equipment_score: float
    best_label: str
    best_score: float

    def print_summary(self) -> None:
        verdict = "ACCEPTED" if self.accepted else "REJECTED"

        print(f"  Equipment score: {self.equipment_score:.2%}")
        print(f"  Best match:      {self.best_label} ({self.best_score:.2%})")
        print(f"  Verdict:         {verdict}")

    def to_dict(self) -> dict:
        return {
            "accepted": self.accepted,
            "equipment_score": self.equipment_score,
            "best_label": self.best_label,
            "best_score": self.best_score,
        }


# ---------------------------------------------------------------------------
# Image loading
# ---------------------------------------------------------------------------

def load_image(image_path: str):
    """Load an image from disk."""
    image = cv2.imread(image_path)

    if image is None:
        raise FileNotFoundError(f"Could not load image: '{image_path}'")

    return image


# ---------------------------------------------------------------------------
# Quality analysis
# ---------------------------------------------------------------------------

def analyze_quality(image) -> QualityReport:
    """Compute blur and brightness metrics."""
    resized = cv2.resize(image, (800, 600))

    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)

    return QualityReport(
        laplacian_var=cv2.Laplacian(gray, cv2.CV_64F).var(),
        brightness=float(gray.mean()),
    )


# ---------------------------------------------------------------------------
# CLIP model
# ---------------------------------------------------------------------------

def load_clip_model():
    """Load CLIP model and processor."""
    print(f"Loading CLIP model ({CLIP_MODEL_NAME})...")

    model = CLIPModel.from_pretrained(
        CLIP_MODEL_NAME,
        cache_dir="./models"
    )

    processor = CLIPProcessor.from_pretrained(
        CLIP_MODEL_NAME,
        cache_dir="./models"
    )

    model.eval()

    print("Model ready.")

    return model, processor


def run_equipment_detection(image, model, processor) -> DetectionResult:
    """
    Run CLIP zero-shot classification to determine whether the image
    contains networking equipment.
    """

    all_labels = EQUIPMENT_LABELS + [NON_EQUIPMENT_LABEL]

    # Convert OpenCV image -> PIL
    pil_image = Image.fromarray(
        cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    )

    # Resize for faster inference
    pil_image.thumbnail((512, 512))

    inputs = processor(
        text=all_labels,
        images=pil_image,
        return_tensors="pt",
        padding=True,
    )

    with torch.inference_mode():
        outputs = model(**inputs)
        probs = outputs.logits_per_image.softmax(dim=1)[0]

    equipment_score = sum(probs[: len(EQUIPMENT_LABELS)]).item()

    best_idx = probs.argmax().item()

    return DetectionResult(
        accepted=equipment_score >= EQUIPMENT_SCORE_THRESHOLD,
        equipment_score=equipment_score,
        best_label=all_labels[best_idx],
        best_score=probs[best_idx].item(),
    )


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Analyze image quality and detect network equipment using CLIP."
    )

    parser.add_argument(
        "image_path",
        nargs="?",
        default=DEFAULT_IMAGE_PATH,
        help=f"Path to image file (default: {DEFAULT_IMAGE_PATH})",
    )

    return parser.parse_args()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    args = parse_args()

    # Load image
    try:
        image = load_image(args.image_path)

    except FileNotFoundError as e:
        print(f"Error: {e}")
        sys.exit(1)

    # Analyze quality
    print("\n--- Image Quality ---")

    quality = analyze_quality(image)

    quality.print_summary()

    if quality.blur_label == "Blurry":
        print("\nImage rejected: too blurry.")
        sys.exit(0)

    if quality.brightness_label in ["Too Dark", "Too Bright"]:
        print("\nImage rejected: bad brightness.")
        sys.exit(0)

    # Run CLIP detection
    print("\n--- Equipment Detection ---")

    model, processor = load_clip_model()

    result = run_equipment_detection(
        image,
        model,
        processor,
    )

    result.print_summary()


if __name__ == "__main__":
    main()