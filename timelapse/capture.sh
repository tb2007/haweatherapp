#!/bin/bash
set -uo pipefail

FRAMES_DIR=/data/frames
OUT_DIR=/data/output
mkdir -p "$FRAMES_DIR" "$OUT_DIR"

SNAPSHOT_URL="http://go2rtc:1984/api/frame.jpeg?src=camera"
CAPTURE_INTERVAL_SECONDS=30
BUILD_EVERY_N_CAPTURES=30          # ~15 min between rebuilds at 30s/capture
PLAYBACK_FPS=24
FRAME_DURATION=0.041667            # 1 / PLAYBACK_FPS — keep these two in sync if tuned
RETAIN_SECONDS=$((24 * 3600 + 300))  # 24h + 5min buffer so the 24h window always has frames

# hours:seconds for each rolling window
WINDOWS=(6:21600 12:43200 24:86400)

build_video() {
  local hours="$1" window_seconds="$2" now_epoch="$3"
  local cutoff
  cutoff=$(date -u -d "@$((now_epoch - window_seconds))" +%Y%m%d_%H%M%S)

  local list_file
  list_file=$(mktemp)
  local last_file=""
  for f in "$FRAMES_DIR"/*.jpg; do
    [ -e "$f" ] || continue
    local base
    base=$(basename "$f" .jpg)
    if [[ "$base" > "$cutoff" ]]; then
      printf "file '%s'\nduration %s\n" "$f" "$FRAME_DURATION" >> "$list_file"
      last_file="$f"
    fi
  done

  if [ -n "$last_file" ]; then
    # concat demuxer ignores the final entry's duration, so repeat the last frame
    printf "file '%s'\n" "$last_file" >> "$list_file"
    ffmpeg -y -f concat -safe 0 -i "$list_file" -r "$PLAYBACK_FPS" -pix_fmt yuv420p \
      -movflags +faststart -loglevel error "$OUT_DIR/snowcam-${hours}h.tmp.mp4" \
      && mv "$OUT_DIR/snowcam-${hours}h.tmp.mp4" "$OUT_DIR/snowcam-${hours}h.mp4"
  fi
  rm -f "$list_file"
}

prune_old_frames() {
  local now_epoch="$1" cutoff
  cutoff=$(date -u -d "@$((now_epoch - RETAIN_SECONDS))" +%Y%m%d_%H%M%S)
  for f in "$FRAMES_DIR"/*.jpg; do
    [ -e "$f" ] || continue
    local base
    base=$(basename "$f" .jpg)
    [[ "$base" < "$cutoff" ]] && rm -f "$f"
  done
}

counter=0
while true; do
  if [ -n "${RTSP_URL:-}" ]; then
    ts=$(date -u +%Y%m%d_%H%M%S)
    curl -sf -m 10 -o "$FRAMES_DIR/$ts.jpg" "$SNAPSHOT_URL" || rm -f "$FRAMES_DIR/$ts.jpg"

    counter=$((counter + 1))
    if [ "$counter" -ge "$BUILD_EVERY_N_CAPTURES" ]; then
      counter=0
      now_epoch=$(date -u +%s)
      prune_old_frames "$now_epoch"
      for window in "${WINDOWS[@]}"; do
        build_video "${window%%:*}" "${window##*:}" "$now_epoch"
      done
    fi
  fi
  sleep "$CAPTURE_INTERVAL_SECONDS"
done
