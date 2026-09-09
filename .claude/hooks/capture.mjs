#!/usr/bin/env node
/**
 * Agent capture hook for the 8x assignment.
 *
 * Wired to two Claude Code lifecycle events in .claude/settings.json:
 *   UserPromptSubmit -> `node capture.mjs prompt`    (fires the moment a prompt is submitted)
 *   Stop             -> `node capture.mjs response`  (fires at end of turn)
 *
 * Both events deliver a JSON payload on stdin carrying session_id and
 * transcript_path. We record ONLY the verbatim prompt and the final assistant
 * text of that turn: no thinking blocks, no tool calls, no tool results, no
 * intermediate steps, no subagent chatter.
 *
 * Every failure path exits 0. A broken logger must never block the session.
 */
import fs from 'node:fs';
import path from 'node:path';

const MODE = process.argv[2]; // 'prompt' | 'response'
const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const LOG_DIR = path.join(ROOT, '.agent-logs');
const STATE_DIR = path.join(ROOT, '.claude', '.capture-state');
const CONFIG_PATH = path.join(ROOT, '.claude', 'capture-config.json');

const readStdin = () =>
  new Promise((resolve) => {
    let raw = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (raw += c));
    process.stdin.on('end', () => resolve(raw));
    process.stdin.on('error', () => resolve(raw));
    setTimeout(() => resolve(raw), 5000); // never hang a turn
  });

const parseJson = (text, fallback) => {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
};

const readJson = (p, fallback) => {
  try {
    return parseJson(fs.readFileSync(p, 'utf8'), fallback);
  } catch {
    return fallback;
  }
};

/** Real conversation turns, oldest first. Meta rows and subagent side-chains dropped. */
function transcriptEntries(transcriptPath) {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) return [];
  return fs
    .readFileSync(transcriptPath, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => parseJson(line, null))
    .filter((e) => e && !e.isSidechain && (e.type === 'user' || e.type === 'assistant'));
}

/** Model of the latest assistant turn, so a mid-build model switch shows up in the log. */
function latestModel(entries) {
  for (let i = entries.length - 1; i >= 0; i--) {
    if (entries[i]?.message?.model) return entries[i].message.model;
  }
  return null;
}

/**
 * The final response for this turn: text from the trailing run of assistant
 * messages, i.e. everything after the last tool result. Only `text` blocks are
 * read, so `thinking` and `tool_use` blocks can never leak into the log.
 */
function finalResponse(entries) {
  const chunks = [];
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    if (e.type !== 'assistant') break;
    const content = e.message?.content;
    const texts = Array.isArray(content)
      ? content.filter((b) => b.type === 'text').map((b) => b.text)
      : typeof content === 'string'
        ? [content]
        : [];
    if (texts.length) chunks.unshift(texts.join('\n\n'));
  }
  return chunks.join('\n\n').trim();
}

/** One file per session, reused for the life of that session. */
function logFileFor(sessionId, now) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const existing = fs.readdirSync(LOG_DIR).find((f) => f.endsWith('_' + sessionId + '.md'));
  if (existing) return path.join(LOG_DIR, existing);
  const stamp = now.toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
  return path.join(LOG_DIR, stamp + '_' + sessionId + '.md');
}

const FRONTMATTER = /^---\n[\s\S]*?\n---\n+/;

function frontmatter(meta) {
  return [
    '---',
    'session_id: ' + meta.session_id,
    'date: ' + meta.date,
    'author: ' + meta.author,
    'model: ' + meta.model,
    'tool: claude-code',
    'project: ' + meta.project,
    'total_exchanges: ' + meta.total_exchanges,
    'first_prompt_time: ' + meta.first_prompt_time,
    'last_prompt_time: ' + meta.last_prompt_time,
    '---',
    '',
    '',
  ].join('\n');
}

/**
 * Returns the entry body. Only the frontmatter counters are ever regenerated;
 * entries already written are returned byte-for-byte and never edited.
 */
function bodyOf(file, meta) {
  if (!fs.existsSync(file)) {
    return [
      '# Session Log - ' + meta.date,
      '',
      'Session: `' + meta.session_id.slice(0, 8) + '` | Project: `' + meta.project +
        '` | Author: `' + meta.author + '`',
      '',
      '---',
      '',
      '',
    ].join('\n');
  }
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(FRONTMATTER);
  return m ? raw.slice(m[0].length) : raw;
}

function entryBlock(type, num, sessionId, iso, model, text) {
  return [
    '[LOG_ENTRY type=' + type + ' num=' + num + ' session=' + sessionId.slice(0, 8) + ']',
    'timestamp: ' + iso,
    'model: ' + model,
    '',
    text,
    '',
    '',
  ].join('\n');
}

async function main() {
  const payload = parseJson(await readStdin(), {});
  const sessionId = payload.session_id || 'unknown-session';
  const now = new Date();
  const iso = now.toISOString();

  const config = readJson(CONFIG_PATH, {});
  const entries = transcriptEntries(payload.transcript_path);

  fs.mkdirSync(STATE_DIR, { recursive: true });
  const statePath = path.join(STATE_DIR, sessionId + '.json');
  const state = readJson(statePath, { num: 0, responded: 0, first_prompt_time: iso });

  const file = logFileFor(sessionId, now);
  const model = latestModel(entries) || state.model || 'unknown';

  const meta = () => ({
    session_id: sessionId,
    date: (state.first_prompt_time || iso).slice(0, 10),
    author: config.author || 'unknown',
    model,
    project: config.project || path.basename(ROOT),
    total_exchanges: state.num,
    first_prompt_time: state.first_prompt_time || iso,
    last_prompt_time: state.last_prompt_time || iso,
  });

  const commit = (type, num, text) => {
    const m = meta();
    const body = bodyOf(file, m);
    fs.writeFileSync(file, frontmatter(m) + body + entryBlock(type, num, sessionId, iso, model, text), 'utf8');
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  };

  if (MODE === 'prompt') {
    state.num += 1;
    state.model = model;
    state.last_prompt_time = iso;
    commit('PROMPT', state.num, payload.prompt ?? '');
  } else if (MODE === 'response') {
    if (state.num === 0 || state.responded >= state.num) return; // nothing pending
    const text = finalResponse(entries);
    if (!text) return; // no final text this turn; leave the prompt open
    state.responded = state.num;
    state.model = model;
    commit('RESPONSE', state.responded, text);
  }
}

main().catch(() => {}).finally(() => process.exit(0));
