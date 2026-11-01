#!/usr/bin/env bash
# Installs Agent Reach + the social-reach Claude Code skill on macOS.
# Usage (from the repo root):  bash scripts/install-social-reach-mac.sh
# No admin password needed. Safe to re-run.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILL_SRC="$REPO_ROOT/.claude/skills/social-reach"
SKILL_DST="$HOME/.claude/skills/social-reach"
CHANNELS=(twitter reddit facebook instagram)

echo "==> 1/5 uv (Python tool installer)"
if ! command -v uv >/dev/null 2>&1; then
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="$HOME/.local/bin:$PATH"
fi

echo "==> 2/5 Agent Reach CLI (from GitHub — NOT the PyPI package of the same name)"
uv tool install --force https://github.com/Panniantong/Agent-Reach/releases/latest/download/agent-reach.zip
export PATH="$HOME/.local/bin:$PATH"
uv tool update-shell >/dev/null 2>&1 || true

echo "==> 3/5 Default setup (English skill text)"
AGENT_REACH_LANG=en agent-reach setup >/dev/null
echo "    done"

echo "==> 4/5 Adding: ${CHANNELS[*]}"
for c in "${CHANNELS[@]}"; do
  if agent-reach add "$c" >/tmp/agent-reach-add-$c.json 2>&1; then
    echo "    + $c"
  else
    echo "    ! $c failed — see /tmp/agent-reach-add-$c.json"
  fi
done

echo "==> 5/5 Installing the social-reach skill for Claude Code"
mkdir -p "$HOME/.claude/skills"
rm -rf "$SKILL_DST"
cp -R "$SKILL_SRC" "$SKILL_DST"
echo "    -> $SKILL_DST"

echo
agent-reach doctor --text || true
cat <<'EOF'

Next — log in yourself (a browser window opens; use a secondary account if you can):
  agent-reach login twitter
  agent-reach login instagram
  agent-reach login facebook
Reddit works without logging in.

Then test:
  agent-reach check twitter --text
  agent-reach reddit search "piano teacher marketing" --limit 3

Open a new terminal (so PATH picks up agent-reach), then start Claude Code.
EOF
