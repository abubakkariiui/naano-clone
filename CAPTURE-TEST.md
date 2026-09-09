# Capture Test

Status: **hook installed and firing autonomously in a session it did not create.
Awaiting two live canaries that include responses** — see [Outstanding](#outstanding).
Not green yet, and build work has not started.

## Tool and model

|  |  |
|---|---|
| Tool | Claude Code `2.1.261`, running in the Claude desktop app (Code tab) |
| Model | `claude-opus-5` — one model, both planning and executing. A switch mid-build would show up per-entry in the `model:` field, not only in the frontmatter. |
| Platform | Windows 11, Node 24.16.0 |

## Mechanism

Claude Code has a first-class hook system, so nothing here is manual and nothing
depends on me remembering to run it. Two lifecycle events are wired:

| Event | Fires | Writes |
|---|---|---|
| `UserPromptSubmit` | the instant a prompt is submitted | `[LOG_ENTRY type=PROMPT ...]` |
| `Stop` | end of turn, once the assistant stops | `[LOG_ENTRY type=RESPONSE ...]` |

Both receive a JSON payload on **stdin** carrying `session_id` and
`transcript_path`. `UserPromptSubmit` also carries the raw `prompt` string, which
is what gets logged verbatim — no truncation, no cleanup.

- **Config file changed:** `.claude/settings.json` (committed)
- **Hook script:** `.claude/hooks/capture.mjs` (committed)
- **Author/project config:** `.claude/capture-config.json` (committed)
- **Log output:** `.agent-logs/` — committed, and deliberately *not* in `.gitignore`.
  The only ignored thing is `.claude/.capture-state/`, the per-session turn counters.

### How "prompt and final response, nothing in between" is enforced

The `Stop` hook reads the session transcript JSONL and walks **backwards from the
end**, collecting the trailing run of `assistant` messages and stopping at the
first `user` message. Tool results arrive as `user` messages, so this yields
exactly the text after the last tool call — the final answer for that turn.

Within those messages it reads **only** blocks of `type === "text"`. So:

- `thinking` blocks — structurally excluded
- `tool_use` / `tool_result` blocks — structurally excluded
- file reads, diffs, retries — never live in a text block, so never logged
- subagent output — entries with `isSidechain: true` are dropped up front

That is exclusion by construction rather than by stripping things out afterwards,
which is why a leak test against a synthetic transcript with planted `thinking`,
`tool_use` and subagent text returned zero matches.

### What it deliberately does not do

- **Never blocks a turn.** Every failure path exits 0; the stdin read times out at 5s.
- **Never invents a response.** If a turn ends with no assistant text, the PROMPT
  entry is left open rather than paired with something fabricated. That behaviour is
  visible in the dead end below.
- **Never edits prompt or response text.** The only thing rewritten inside an
  existing entry is one metadata field — see the next section. Frontmatter counters
  (`total_exchanges`, `last_prompt_time`) are regenerated on each write by design,
  since the format requires them.
- **Idempotent.** A duplicate `Stop` is a no-op, so a turn cannot be logged twice.

### The one after-the-fact write, and why

A session's *first* prompt is submitted before any assistant message exists, so its
model is genuinely unknowable at write time and lands as `model: unknown`. When that
turn ends, `backfillModel()` fills in that one field on that one entry. It is bounded
to the entry header and only ever replaces the literal string `model: unknown`.
Prompt and response text are untouched.

I judged a correct model field worth more than a purist append-only claim — the
alternative was every session's first entry permanently reading `unknown`, which
defeats the point of recording the model at all. Flagging it here rather than
leaving you to find it in the diff.

## Log file the canaries landed in

`.agent-logs/2026-09-09_08-18-10_1ef74c5a-c0fc-4499-b7fa-4bb100c3f7c8.md`

## Canary entries, raw

### Canary 1 — hook firing in a session it did not create

I did not want to take "it works in the session that installed it" on trust, so
instead of prompting myself I started a **separate** Claude Code session from the
CLI in the repo root:

```bash
claude -p "CAPTURE TEST — 8x assignment, Abubakkar"
```

New process, new session id, hooks loaded from the committed project settings.
Pasted raw from
`.agent-logs/2026-09-09_08-18-10_1ef74c5a-c0fc-4499-b7fa-4bb100c3f7c8.md`:

```
---
session_id: 1ef74c5a-c0fc-4499-b7fa-4bb100c3f7c8
date: 2026-09-09
author: abubakkariiui
model: unknown
tool: claude-code
project: naano-rebuild
total_exchanges: 1
first_prompt_time: 2026-09-09T08:18:10.719Z
last_prompt_time: 2026-09-09T08:18:10.719Z
---

# Session Log - 2026-09-09

Session: `1ef74c5a` | Project: `naano-rebuild` | Author: `abubakkariiui`

---

[LOG_ENTRY type=PROMPT num=1 session=1ef74c5a]
timestamp: 2026-09-09T08:18:10.719Z
model: unknown

CAPTURE TEST — 8x assignment, Abubakkar
```

**This proves the hook fires on its own in a foreign session — and it proves it
half-failed.** The CLI could not authenticate:

```
Failed to authenticate: OAuth session expired and could not be refreshed
```

So there was never an assistant turn. The `Stop` hook had no final text to read and
correctly declined to write a RESPONSE, and `model` stayed `unknown` because no
assistant message ever existed to read one from. The prompt half of capture is
proven live; the response half is, so far, only proven against a synthetic
transcript. I am leaving this partial entry in the log rather than deleting it —
it is the honest record of what happened.

### Canary 2

_Pending — see Outstanding._

## Things I tried first that did not work

1. **`readJson(await readStdin())`** — my stdin parser *was* the file-reading helper.
   It `readFileSync`'d a JSON *string* as though it were a path, threw, and fell back
   to `{}`. Result: the first test logged to `unknown-session.md` with an empty
   prompt. Split into `parseJson` (takes a string) and `readJson` (takes a path).

2. **Two silent patch misses.** Two follow-up edits whose search strings contained a
   literal `\n` never matched, while a third with no backslashes applied fine —
   backslashes were being doubled somewhere in the tool transport. My patcher
   reported success anyway because it had no assertions, and the only symptom was a
   blank line quietly missing after the frontmatter. Fixed by asserting on every
   replacement and anchoring on backslash-free substrings. A miss is now loud.

3. **A blank line creeping in on every write.** The frontmatter regex
   `/^---\n[\s\S]*?\n---\n/` consumed only one trailing newline, so the body kept
   its leading newline and the file gained a blank line per rewrite. Changed to
   `\n---\n+` so the separator is fully consumed and regenerated.

4. **Testing `Stop` extraction against the real live transcript was useless.** Read
   mid-turn, the transcript always ends in a `tool_use` block, so extraction
   correctly returned nothing every time and looked broken. Building a synthetic
   transcript with planted `thinking` / `tool_use` / `tool_result` / `isSidechain`
   content is what made a real leak test possible.

5. **Driving the test payload with `printf`** mangled the UTF-8 em dash and the
   escape sequences. Switched to writing the payload as a JSON file via `json.dumps`
   and piping it in, which is closer to what Claude Code actually delivers.

## Outstanding

Correction to an assumption I recorded earlier: I expected Claude Code to snapshot
hook config at session start, so that the session which *wrote* the hooks could not
fire them. That is wrong for the desktop app — it picked the new hooks up mid-session
and logged its own canary (canary 2 below). The CLI route to a fresh session remains
blocked on expired OAuth.

Still needed:

1. Send `CAPTURE TEST — 8x assignment, Abubakkar` in a **newly started** session in
   this folder.
2. Repeat in a **second** new session.

This file gets updated with both raw entries once they land. Build work starts after
that, not before.
