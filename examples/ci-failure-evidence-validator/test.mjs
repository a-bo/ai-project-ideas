import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateIncident } from './validate-ci-evidence.mjs';

const fixture = JSON.parse(await readFile(new URL('./ci-failure.synthetic.json', import.meta.url), 'utf8'));
const mutate = (fn) => { const copy = structuredClone(fixture); fn(copy); return validateIncident(copy); };
assert.equal(validateIncident(fixture).valid, true, 'A01 valid same-run evidence');
assert.equal(mutate((x) => { x.evidence[0].run_id = 'other'; }).valid, false, 'A02 reject cross-run evidence');
assert.equal(mutate((x) => { x.evidence[0].truncated = true; x.claims[0].text = 'Root cause 已定位'; }).valid, false, 'A03 reject root cause from truncation');
assert.equal(mutate((x) => { x.run.outcome = 'cancelled'; }).valid, true, 'A04 preserve cancellation');
assert.equal(mutate((x) => { x.run.outcome = 'missing_log'; }).valid, true, 'A05 preserve missing log');
assert.equal(mutate((x) => { x.evidence[0].text = 'github_pat_abcdefghijklmnopqrstuvwxyz_123456789'; }).valid, false, 'A06 reject token-like content');
assert.equal(mutate((x) => { x.claims[1].needs_human_confirmation = false; }).valid, false, 'A07 confirm hypotheses');
assert.equal(mutate((x) => { x.evidence[0].sha256 = 'bad'; }).valid, false, 'A08 validate SHA');
assert.equal(mutate((x) => { x.claims[0].evidence_ids = ['MISSING']; }).valid, false, 'A09 require traceability');
assert.equal(mutate((x) => { x.actions[0].text = 'Automatically rerun the workflow'; }).valid, false, 'A10 forbid automatic action');
console.log('10 acceptance tests passed');
