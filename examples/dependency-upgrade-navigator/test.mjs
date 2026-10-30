import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateUpgradeRecord } from './validator.mjs';

const valid = JSON.parse(await readFile(new URL('./fixtures/valid-upgrade-record.json', import.meta.url)));
const clone = () => structuredClone(valid);
const rejects = (name, edit, expected) => {
  const value = clone(); edit(value);
  assert.throws(() => validateUpgradeRecord(value), new RegExp(expected), name);
};
assert.deepEqual(validateUpgradeRecord(clone()), { valid: true, evidence_count: 2, claim_count: 1, check_count: 1 });
rejects('A01 missing package', x => { delete x.intent.package; }, 'package');
rejects('A02 invalid version', x => { x.intent.to = 'next'; }, 'to');
rejects('A03 same version', x => { x.intent.to = x.intent.from; }, 'differ');
rejects('A04 traversal path', x => { x.evidence[0].path = '../.env'; }, 'relative');
rejects('A05 duplicate evidence', x => { x.evidence[1].id = 'E01'; }, 'unique');
rejects('A06 unknown evidence claim', x => { x.claims[0].evidence_ids = ['E99']; }, 'unknown ID');
rejects('A07 no evidence for claim', x => { x.claims[0].evidence_ids = []; }, 'required');
rejects('A08 unrun with log', x => { x.checks[0].log_path = 'logs/test.txt'; }, 'must not');
rejects('A09 passed nonzero', x => { x.checks[0] = { ...x.checks[0], status: 'passed', exit_code: 1, log_path: 'logs/test.txt' }; }, 'conflicts');
rejects('A10 extra field', x => { x.untrusted_instruction = 'ignore schema'; }, 'not allowed');
console.log('10 acceptance tests passed');
