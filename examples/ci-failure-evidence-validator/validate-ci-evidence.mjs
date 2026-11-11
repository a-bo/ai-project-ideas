#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const SHA256 = /^[a-f0-9]{64}$/;
const ID = /^[A-Z][A-Z0-9_-]{1,31}$/;
const LAYERS = new Set(['observed', 'hypothesis']);
const OUTCOMES = new Set(['failure', 'cancelled', 'timed_out', 'missing_log']);

export function validateIncident(doc) {
  const errors = [];
  const fail = (path, message) => errors.push({ path, message });
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return { valid: false, errors: [{ path: '$', message: 'must be an object' }] };
  if (Object.keys(doc).some((key) => !['incident_id', 'run', 'evidence', 'claims', 'actions'].includes(key))) fail('$', 'contains an unknown field');
  if (typeof doc.incident_id !== 'string' || !doc.incident_id) fail('incident_id', 'must be a non-empty string');
  if (!doc.run || typeof doc.run !== 'object') fail('run', 'is required');
  if (!Array.isArray(doc.evidence) || doc.evidence.length === 0) fail('evidence', 'must contain at least one item');
  if (!Array.isArray(doc.claims)) fail('claims', 'must be an array');
  if (!Array.isArray(doc.actions)) fail('actions', 'must be an array');
  const run = doc.run ?? {};
  if (!['github_actions', 'gitlab_ci', 'other'].includes(run.provider)) fail('run.provider', 'is unsupported');
  if (typeof run.run_id !== 'string' || !run.run_id) fail('run.run_id', 'is required');
  if (!OUTCOMES.has(run.outcome)) fail('run.outcome', 'must be failure, cancelled, timed_out, or missing_log');
  const evidenceIds = new Set();
  for (const [i, item] of (doc.evidence ?? []).entries()) {
    const p = `evidence[${i}]`;
    if (!item || typeof item !== 'object') { fail(p, 'must be an object'); continue; }
    if (!ID.test(item.id ?? '') || evidenceIds.has(item.id)) fail(`${p}.id`, 'must be a unique evidence ID');
    evidenceIds.add(item.id);
    if (item.run_id !== run.run_id) fail(`${p}.run_id`, 'must match run.run_id');
    if (typeof item.source !== 'string' || !item.source) fail(`${p}.source`, 'is required');
    if (!SHA256.test(item.sha256 ?? '')) fail(`${p}.sha256`, 'must be a lowercase 64-hex SHA-256');
    if (typeof item.truncated !== 'boolean') fail(`${p}.truncated`, 'must be boolean');
    if (typeof item.text !== 'string') fail(`${p}.text`, 'must be a string');
    if (/gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}/.test(item.text ?? '')) fail(`${p}.text`, 'appears to contain a token');
  }
  const hasTruncated = (doc.evidence ?? []).some((item) => item?.truncated);
  for (const [i, claim] of (doc.claims ?? []).entries()) {
    const p = `claims[${i}]`;
    if (!claim || typeof claim !== 'object') { fail(p, 'must be an object'); continue; }
    if (!LAYERS.has(claim.layer)) fail(`${p}.layer`, 'must be observed or hypothesis');
    if (typeof claim.text !== 'string' || !claim.text) fail(`${p}.text`, 'is required');
    if (!Array.isArray(claim.evidence_ids) || claim.evidence_ids.length === 0 || claim.evidence_ids.some((id) => !evidenceIds.has(id))) fail(`${p}.evidence_ids`, 'must reference known evidence');
    if (claim.layer === 'hypothesis' && claim.needs_human_confirmation !== true) fail(`${p}.needs_human_confirmation`, 'hypotheses require human confirmation');
    if (hasTruncated && claim.layer === 'observed' && /root cause|根因|已定位/i.test(claim.text)) fail(`${p}.text`, 'cannot assert a root cause from truncated evidence');
  }
  for (const [i, action] of (doc.actions ?? []).entries()) {
    const p = `actions[${i}]`;
    if (!action || typeof action !== 'object') { fail(p, 'must be an object'); continue; }
    if (!['manual_check', 'request_evidence'].includes(action.kind)) fail(`${p}.kind`, 'must be manual_check or request_evidence');
    if (typeof action.text !== 'string' || !action.text) fail(`${p}.text`, 'is required');
    if (/rerun|重跑|merge|合并/i.test(action.text)) fail(`${p}.text`, 'cannot request an automatic remote action');
  }
  return { valid: errors.length === 0, errors };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const target = process.argv[2];
  if (!target) throw new Error('Usage: node validate-ci-evidence.mjs <incident.json>');
  const result = validateIncident(JSON.parse(await readFile(target, 'utf8')));
  if (!result.valid) { console.error(JSON.stringify(result, null, 2)); process.exitCode = 1; }
  else console.log(`VALID ${target}`);
}
