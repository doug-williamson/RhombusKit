#!/usr/bin/env node
// Lists community-credit trailers for the commits in a release range, so the
// curated release history (docs/release-history.md) and the GitHub release
// notes can credit the people whose suggestions shipped ("requested by @user").
//
// Convention (maintainer-side, applied when merging a community-driven change):
//
//   Requested-by: @handle (#123)
//
// One trailer line per requester; repeat the line for multiple requesters.
//
// Usage:
//   node tools/release-credits.mjs              # latest tag..HEAD
//   node tools/release-credits.mjs v1.4.0..HEAD
//   node tools/release-credits.mjs v1.3.0..v1.4.0
import { execFileSync } from 'node:child_process';

const US = '\x1f'; // field separator within a commit record
const RS = '\x1e'; // record separator between commits

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' });
}

function resolveRange() {
  const arg = process.argv[2];
  if (arg) return arg;
  try {
    const tag = git(['describe', '--tags', '--abbrev=0']).trim();
    return `${tag}..HEAD`;
  } catch {
    return 'HEAD'; // no tags yet — scan the full history
  }
}

const range = resolveRange();
const raw = git(['log', range, `--format=%H${US}%s${US}%b${RS}`]);
const commits = raw
  .split(RS)
  .map((commit) => commit.trim())
  .filter(Boolean);

const credits = [];
for (const commit of commits) {
  const [, subject = '', body = ''] = commit.split(US);
  for (const match of body.matchAll(/^Requested-by:\s*(.+)$/gim)) {
    credits.push({ subject: subject.trim(), requester: match[1].trim() });
  }
}

if (credits.length === 0) {
  console.log(`No "Requested-by:" trailers found in ${range}.`);
  console.log(
    'Add `Requested-by: @handle (#123)` to a commit when a change ships a community request.',
  );
  process.exit(0);
}

console.log(`Community-requested changes in ${range}:\n`);
for (const { subject, requester } of credits) {
  console.log(`- ${subject} — requested by ${requester}`);
}
