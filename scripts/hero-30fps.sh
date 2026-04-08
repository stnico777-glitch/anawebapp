#!/usr/bin/env bash
# Re-apply 30fps H.264 pass to web hero assets (run from repo root after editing masters).
set -euo pipefail
cd "$(dirname "$0")/.."
for b in \
  hero-video-sm \
  hero-video-lg \
  hero-video-reverse-sm \
  hero-video-reverse-lg \
  hero-carousel-awake-align-sm \
  hero-carousel-awake-align-lg
do
  p="public/${b}.mp4"
  t="public/${b}.tmp.mp4"
  ffmpeg -y -i "$p" -an -vf fps=30 -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p -movflags +faststart "$t"
  mv "$t" "$p"
  echo "ok $b"
done
