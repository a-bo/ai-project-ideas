import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateRolloutReview } from './validate-rollout-review.mjs';

const base = JSON.parse(fs.readFileSync(new URL('./feature-flag.synthetic.json', import.meta.url), 'utf8'));
const clone = () => JSON.parse(JSON.stringify(base));
const rejects = (mutate, fragment) => {
  const value = clone(); mutate(value);
  assert.throws(() => validateRolloutReview(value), new RegExp(fragment));
};

assert.equal(validateRolloutReview(base).status, 'VALID_FOR_HUMAN_REVIEW_ONLY');
rejects(x => { x.flags[0].environment = 'production'; }, 'mixes environments');
rejects(x => { x.stages.push({...x.stages[0], stage_id:'S2', target_percent:1, evidence_id:'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'}); }, 'rolls percentage backwards');
rejects(x => { x.stages[0].stop_rule = ''; }, 'stop_rule');
rejects(x => { x.stages[0].rollback_owner_role = ''; }, 'rollback_owner_role');
rejects(x => { x.observations[0].stage_id = 'S9'; }, 'unknown stage');
rejects(x => { x.observations[0].status = 'healthy'; }, 'not allowed');
rejects(x => { x.approvals[0].scope = 'Authorization: Bearer abc'; }, 'sensitive text');
rejects(x => { x.flags[0].evidence_id = 'not-a-sha'; }, 'SHA-256');
rejects(x => { x.note = 'approved for full rollout'; }, 'success or rollout-decision');
console.log('10 acceptance tests passed');
