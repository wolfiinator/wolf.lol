#!/usr/bin/env python3
"""Download public music files from a Google Drive folder and generate a runtime manifest.

Usage:
  python3 scripts/sync_drive_music.py

Requires:
  - gdown CLI (`pip install gdown`)
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path

DEFAULT_DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1zmM2c1RbJLZZFz7hnBZJb7OlpqHHKSeG?usp=sharing"
OUTPUT_FOLDER = Path("music/drive_import")
MANIFEST_PATH = Path("music/drive_manifest.json")
AUDIO_EXTENSIONS = {".mp3", ".wav", ".m4a", ".flac", ".ogg", ".aac"}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def ensure_gdown_installed() -> None:
    try:
        subprocess.run(["gdown", "--version"], check=True, capture_output=True, text=True)
    except (FileNotFoundError, subprocess.CalledProcessError):
        print("gdown is required. Install it with: pip install gdown", file=sys.stderr)
        sys.exit(1)


def normalize_drive_folder_url(raw_url: str) -> str:
    """Extract and normalize a Drive folder URL to reduce gdown parsing issues."""
    match = re.search(r"/folders/([a-zA-Z0-9_-]+)", raw_url)
    if match:
        folder_id = match.group(1)
        return f"https://drive.google.com/drive/folders/{folder_id}"
    return raw_url


def download_drive_folder(folder_url: str) -> None:
    OUTPUT_FOLDER.mkdir(parents=True, exist_ok=True)
    cmd = [
        "gdown",
        "--folder",
        folder_url,
        "-O",
        str(OUTPUT_FOLDER),
        "--remaining-ok",
    ]
    result = subprocess.run(cmd, text=True)
    if result.returncode != 0:
        print("Failed to download from Google Drive.", file=sys.stderr)
        sys.exit(result.returncode)


def collect_files() -> tuple[list[str], str | None]:
    tracks: list[str] = []
    cover: str | None = None

    for path in sorted(OUTPUT_FOLDER.rglob("*")):
        if not path.is_file():
            continue
        relative_path = path.relative_to(OUTPUT_FOLDER).as_posix()
        extension = path.suffix.lower()

        if extension in AUDIO_EXTENSIONS:
            tracks.append(relative_path)
        elif extension in IMAGE_EXTENSIONS and cover is None:
            cover = relative_path

    return tracks, cover


def write_manifest(tracks: list[str], cover: str | None) -> None:
    manifest = {
        "artists": [
            {
                "name": "Google Drive Imports",
                "folder": OUTPUT_FOLDER.as_posix(),
                "cover": cover,
                "tracks": tracks,
            }
        ]
    }

    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2), encoding="utf-8")


def main() -> None:
    ensure_gdown_installed()

    configured_url = os.environ.get("DRIVE_FOLDER_URL", DEFAULT_DRIVE_FOLDER_URL).strip()
    folder_url = normalize_drive_folder_url(configured_url)

    download_drive_folder(folder_url)
    tracks, cover = collect_files()

    if not tracks:
        print(
            "No audio files were found after sync. Confirm the folder is public and contains supported audio files.",
            file=sys.stderr,
        )

    write_manifest(tracks, cover)
    print(f"Synced {len(tracks)} track(s) from {folder_url} to {MANIFEST_PATH}")


if __name__ == "__main__":
    main()
