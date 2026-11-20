#!/usr/bin/env python3
"""
Build a clean GitHub/Vercel upload package from tracked git files.

Usage:
    python3 scripts/package-release.py

Output:
    hivecomp-github-vercel.zip            (repo root)
    public/hivecomp-github-vercel.zip     (browser download copy)

Both outputs are git-ignored. The package is built strictly from
`git ls-files`, so `.env`, `node_modules`, `.next` and `.git` can never
leak into it — and it refuses to run if any of those are tracked.
"""

from __future__ import annotations

import hashlib
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_NAME = "hivecomp-github-vercel.zip"
TOP_DIR = "hivecomp"
FORBIDDEN = (".env", ".env.local", ".env.production", "node_modules", ".next", ".git", ".vercel")


def tracked_files() -> list[str]:
    out = subprocess.run(
        ["git", "ls-files", "-z"], cwd=ROOT, check=True, capture_output=True
    ).stdout
    return sorted(p for p in out.decode().split("\0") if p)


def main() -> None:
    files = tracked_files()
    if not files:
        sys.exit("git ls-files returned nothing — run this inside the repository.")

    leaked = [f for f in files if f in FORBIDDEN or f.startswith(tuple(f"{d}/" for d in FORBIDDEN))]
    if leaked:
        sys.exit(f"REFUSING to package — sensitive/generated files are tracked: {leaked}")

    out = ROOT / OUT_NAME
    if out.exists():
        out.unlink()

    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for rel in files:
            archive.write(ROOT / rel, f"{TOP_DIR}/{rel}")

    data = out.read_bytes()

    # Browser-download copy served from /hivecomp-github-vercel.zip
    public_copy = ROOT / "public" / OUT_NAME
    public_copy.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(out, public_copy)

    public_count = sum(1 for f in files if f.startswith("public/"))
    print(f"Berkas di dalam paket : {len(files)}")
    print(f"  - public/           : {public_count}  (upload web GitHub: bagi menjadi 2 batch)")
    print(f"  - selain public/    : {len(files) - public_count}  (1 batch)")
    print(f"Ukuran                : {len(data) / 1024 / 1024:.2f} MB")
    print(f"SHA-256               : {hashlib.sha256(data).hexdigest()}")
    print(f"Dibuat                : {out}")
    print(f"Salinan unduhan       : {public_copy}  ->  /{OUT_NAME}")


if __name__ == "__main__":
    main()
