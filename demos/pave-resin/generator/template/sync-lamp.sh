#!/bin/zsh
# Copies the Lamp CTA + Glint Button CSS from the master template into this generator (lamp.css).
# Usage: ./sync-lamp.sh [path to demos/master]   (default ~/dev/lamp-wt/demos/master)
set -e
M=${1:-$HOME/dev/lamp-wt/demos/master}/components/library
cd "$(dirname $0)"
{
  echo "/* GENERATED COPY, do not edit here. Source of truth: Clause-code demos/master/components/library/{glint-button,lamp-cta}/*.css"
  echo "   (branch claude/lamp-cta). Re-sync with ./sync-lamp.sh */"
  cat "$M/glint-button/glint-button.css" "$M/lamp-cta/lamp-cta.css"
} > lamp.css
echo "lamp.css synced from $M"
