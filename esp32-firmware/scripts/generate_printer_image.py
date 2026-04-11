Import("env")

from pathlib import Path
import subprocess
import sys


PROJECT_DIR = Path(env["PROJECT_DIR"])
SOURCE_IMAGE = PROJECT_DIR / "assets" / "waste-dithered.png"
OUTPUT_DIR = PROJECT_DIR / "src" / "generated"
OUTPUT_HEADER = OUTPUT_DIR / "waste_dithered_image.h"
TARGET_WIDTH = 384


def die(message: str) -> None:
    print(f"[generate_printer_image] {message}", file=sys.stderr)
    raise SystemExit(1)


def run_magick() -> bytes:
    cmd = [
        "magick",
        str(SOURCE_IMAGE),
        "-resize",
        f"{TARGET_WIDTH}x",
        "-background",
        "white",
        "-alpha",
        "remove",
        "-alpha",
        "off",
        "-threshold",
        "50%",
        "pbm:-",
    ]
    try:
        result = subprocess.run(cmd, check=True, capture_output=True)
    except FileNotFoundError:
        die("ImageMagick 'magick' is required to build the printer image asset.")
    except subprocess.CalledProcessError as exc:
        die(f"magick failed: {exc.stderr.decode(errors='ignore')}")
    return result.stdout


def parse_pbm(blob: bytes) -> tuple[int, int, bytes]:
    if not blob.startswith(b"P4"):
        die("magick did not produce a binary PBM file.")

    header_end = blob.find(b"\n", blob.find(b"\n") + 1)
    if header_end == -1:
        die("Could not parse PBM header.")

    header = blob[: header_end + 1].decode("ascii", errors="strict")
    tokens = []
    for line in header.splitlines():
        if line.startswith("#"):
            continue
        tokens.extend(line.split())

    if len(tokens) < 3 or tokens[0] != "P4":
        die("Unexpected PBM header format.")

    width = int(tokens[1])
    height = int(tokens[2])
    return width, height, blob[header_end + 1 :]


def write_header(width: int, height: int, data: bytes) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    bytes_per_row = (width + 7) // 8
    if len(data) != bytes_per_row * height:
        die(f"Unexpected image data size: got {len(data)}, expected {bytes_per_row * height}.")

    lines = [
        "#pragma once",
        "",
        "#include <cstddef>",
        "#include <cstdint>",
        "",
        "namespace GeneratedPrinterImage {",
        f"constexpr uint16_t kWasteImageWidth = {width};",
        f"constexpr uint16_t kWasteImageHeight = {height};",
        f"constexpr size_t kWasteImageDataSize = {len(data)};",
        "static const uint8_t kWasteImageData[] = {",
    ]

    for index in range(0, len(data), 12):
        chunk = data[index : index + 12]
        rendered = ", ".join(f"0x{byte:02X}" for byte in chunk)
        suffix = "," if index + 12 < len(data) else ""
        lines.append(f"  {rendered}{suffix}")

    lines += [
        "};",
        "}  // namespace GeneratedPrinterImage",
        "",
    ]

    OUTPUT_HEADER.write_text("\n".join(lines), encoding="ascii")


if not SOURCE_IMAGE.exists():
    die(f"Source image not found: {SOURCE_IMAGE}")

pbm = run_magick()
width, height, data = parse_pbm(pbm)
write_header(width, height, data)
