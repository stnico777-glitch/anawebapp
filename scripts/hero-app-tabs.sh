#!/usr/bin/env bash
# High-quality app-tab hero clips for a full-width band on retina displays.
# Encode from the full master (4K / high fps) — NOT from hero-video-sm/lg (those are too small and look soft).
# Master path: override with HERO_MASTER=public/your-export.mp4
# Run from repo root: npm run hero:app-tabs
set -euo pipefail
cd "$(dirname "$0")/.."

MASTER="${HERO_MASTER:-public/hero-video.mp4}"
if [[ ! -f "$MASTER" ]]; then
  echo "error: missing $MASTER — add your 4K master or set HERO_MASTER" >&2
  exit 1
fi

encode_one() {
  local dst=$1
  local max_w=$2
  local tmp="public/${dst}.tmp.mp4"
  # Lanczos downscale from 4K; 90fps to match typical pro exports; CRF 18 + slow = much sharper than old 720px/crf24.
  ffmpeg -y -i "$MASTER" -an \
    -vf "scale='min(${max_w},iw)':-2:flags=lanczos+accurate_rnd,fps=90" \
    -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart \
    "$tmp"
  mv "$tmp" "public/${dst}.mp4"
  echo "ok ${dst}"
}

# (max-width: 768px) source — 1280px covers ~640css @2x; bump if phones still look soft.
encode_one hero-app-tabs-sm 1280
# Desktop / tablet landscape — 2560px holds up on 1440p+ wide heroes and retina.
encode_one hero-app-tabs-lg 2560
