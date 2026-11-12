#!/bin/zsh
# Copies the 6 signature sections (layer-build, step-rail, benefit-illustrations, proof-tiles,
# guarantee-stack, owner-signature) + their runtime from the master library into template/sig/.
# Usage: ./sync-sig.sh [path to demos/master]   (default ~/dev/sig-wt/demos/master)
set -e
M=${1:-$HOME/dev/sig-wt/demos/master}/components/library
cd "$(dirname $0)"
rm -rf sig && mkdir -p sig
for c in sig-runtime layer-build step-rail benefit-illustrations proof-tiles guarantee-stack owner-signature; do
  mkdir -p sig/$c && cp $M/$c/*.mjs $M/$c/*.css sig/$c/ 2>/dev/null || true
  [ -f $M/$c/sig-runtime.js ] && cp $M/$c/sig-runtime.js sig/$c/
done
cp -R $M/owner-signature/fonts sig/owner-signature/
echo "/* GENERATED COPY, do not edit here. Source: Clause-code demos/master/components/library (branch claude/signature-sections). Re-sync with ./sync-sig.sh */" > sig/README.txt
echo "sig/ synced from $M"
