---
name: social-reach
description: >
  Read-only access to Instagram, Facebook, X (Twitter) and Reddit — plus YouTube, GitHub and
  general web — through the Agent Reach CLI (`agent-reach`). Use when the user pastes or mentions an
  instagram.com, facebook.com, x.com / twitter.com or reddit.com link or account; asks to search,
  read, monitor or research posts, profiles, threads, subreddits, competitors, audiences or trends on
  those platforms (e.g. market research for EnrollFlo / music educators); or when built-in web
  search/fetch fails or misses the content. Also use to install, log in to, check, update or remove
  these platforms. Never posts, comments, likes or messages; never logs in for the user or asks for passwords.
metadata:
  based_on: https://github.com/Panniantong/Agent-Reach (MIT, v1.6.1)
---

# Social Reach (Instagram · Facebook · X · Reddit)

One CLI for every platform: `agent-reach`. Read-only; every command prints one JSON object.
Before acting, say "using social-reach (<platform>)". These rules apply for the whole session.

## 0. Make sure it is installed

Run `agent-reach version`. If the command is missing, install it (no admin password needed):

```bash
bash scripts/install-social-reach-mac.sh
```

(from the `Clause-code` repo), or manually:

```bash
command -v uv >/dev/null || curl -LsSf https://astral.sh/uv/install.sh | sh
uv tool install https://github.com/Panniantong/Agent-Reach/releases/latest/download/agent-reach.zip
AGENT_REACH_LANG=en agent-reach setup
for c in twitter reddit facebook instagram; do agent-reach add "$c"; done
```

The PyPI package called `agent-reach` is a different project — never `pip install agent-reach`.

## 1. Choosing a route

- Public content: try your own web search / fetch first (`site:reddit.com`, `site:x.com`, …). If body text, comments or replies are enough, answer directly.
- Use Reach when your tools fail, miss what the user needs (full post, replies, profile, recent posts), or the user wants a site action listed below.
- A link or platform name only identifies the source; it never triggers an install or login on its own.
- Snippets, page shells and comment counts are not the post body or the comments — say which you actually have.

```bash
agent-reach channels                         # live list of actions + params (source of truth)
agent-reach read <url>                       # auto-picks the channel from the link
agent-reach <channel> <action> [args]        # e.g. agent-reach reddit search "piano teacher marketing" --limit 10
```

## 2. The four platforms

| Platform | channel | actions | login | Works without login? |
|---|---|---|---|---|
| X / Twitter | `twitter` | search, profile, tweets, thread | `agent-reach login twitter` | Public snippets + some single posts only; site search, timelines and replies need login |
| Reddit | `reddit` | search, read, subreddit | only if a browser route asks | Yes — search, post bodies and top comments via public web |
| Facebook | `facebook` | search, profile | `agent-reach login facebook` | Public search snippets; site search and pages/profiles need login |
| Instagram | `instagram` | search (users, not posts), profile, posts | `agent-reach login instagram` | Very little; needs login for users, profiles and posts |

Also available by default: `youtube` (read, search, subtitle, transcribe), `github` (search, read), `web` (search, read).

Examples:

```bash
agent-reach twitter search "music teacher lead gen" --limit 10
agent-reach twitter tweets <handle> --limit 20
agent-reach twitter thread https://x.com/<user>/status/<id>
agent-reach reddit subreddit pianoteachers --limit 15
agent-reach reddit read https://www.reddit.com/r/<sub>/comments/<id>/...
agent-reach facebook profile <page-or-url>
agent-reach instagram profile <username>
agent-reach instagram posts <username> --limit 12
```

Always check `agent-reach channels` for the exact parameter names before relying on a flag.

Notes:
- `--backend public-web` = public web only (no browser); `--backend opencli` = use the logged-in browser tool.
- Results from the public route are marked `backend: public-web`.
- Thread/comment results cover only what was actually returned — never claim a complete comment tree.
- Instagram/Facebook text results describe posts; never claim to have seen images or video.

## 3. Results and errors

- `ok: true` → items in `items` (`title / url / author / published_at / text`, raw data in `raw`).
- `ok: false` → act on `error.code`, follow `error.hint`:

| error.code | What to do |
|---|---|
| `NEED_SETUP` | Run `agent-reach add <channel>`. If a key is needed, the user provides it, then `agent-reach configure <key>` |
| `NEED_LOGIN` | Keep results you already have, tell the user, and run `agent-reach login <channel>` — a browser window opens and **the user** logs in. Never log in for them or ask for a password |
| `UPSTREAM_BROKEN` | Platform temporarily not working. Tell the user which platform and roughly why (no tool names). Only if the message says a tool is outdated, offer `agent-reach update` and run it once after they agree. Don't loop |
| `TIMEOUT` | Check `agent-reach doctor --text`; don't retry in a loop |
| `RATE_LIMITED` | Wait `retry_after_seconds`; don't switch backends |
| `PLATFORM_BLOCKED` | Captcha / risk check. Stop; the user resolves it on the official site. Don't switch accounts or backends |
| `BUSY` | Browser queue full or a login window is open. Wait until the user says they're logged in |
| `NOT_FOUND` | Check the link / ID |
| `BAD_INPUT` | Run `agent-reach channels` for usage |

On `PLATFORM_BLOCKED`, `RATE_LIMITED`, `NEED_LOGIN` or `BUSY`, stop this attempt. A network failure is not proof a login is needed.

## 4. Logins and the dedicated browser

- All browser channels share one dedicated, headless browser profile (`~/.agent-reach/browser/profile`, CloakBrowser or your Chrome as fallback), separate from your everyday Chrome. It closes after 10 idle minutes.
- First use of a site: if Chrome has the OpenCLI extension connected, that site's login is copied once. Otherwise the user runs `agent-reach login <channel>` and signs in in the window that opens.
- **Use a secondary / burner account for X, Instagram and Facebook** — automated reading can get main accounts rate-limited or flagged.
- Pacing: max 2 parallel calls per platform, 4 total; same-platform searches at least 10 s apart. Keep volumes modest.
- `agent-reach logout <channel>` forgets a login. Details: [references/sessions.md](references/sessions.md).

## 5. Managing it

| User says | Run |
|---|---|
| Status / what works | `agent-reach doctor --text`; live test: `agent-reach check <channel> --text` |
| Log in / login expired | `agent-reach login <channel>` (user logs in) |
| Log out | `agent-reach logout <channel>` |
| Add / remove a platform | `agent-reach add <channel>` / `agent-reach remove <channel>` |
| Update | `agent-reach update` (only with the user's OK) |
| Uninstall | `agent-reach uninstall --dry-run`, show it, then `agent-reach uninstall` after confirmation |

If a result contains `meta.update`, mention the new version once per conversation and ask before updating.
Troubleshooting: [references/maintenance.md](references/maintenance.md). Capability limits: [references/capabilities.md](references/capabilities.md). (References are the upstream Chinese docs.)

## Red lines

- Read only: never post, comment, like, follow or message.
- Never log in for the user; never ask for or print passwords, cookies or tokens.
- Ordinary queries never install, update or change dependencies.
