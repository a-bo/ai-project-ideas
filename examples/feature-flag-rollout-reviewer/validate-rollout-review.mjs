#!/usr/bin/env node
import fs from 'node:fs';

const SENSITIVE = /(?:authorization\s*:|\b(?:token|cookie|password|secret)\s*[=:])/i;
const SHA256 = /^[a-f0-9]{64}$/;

function fail(message) {
  throw new Error(message);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function requiredString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') fail(`${label} must be a non-empty string`);
}

export function validateRolloutReview(input) {
  if (!isObject(input)) fail('review must be an object');
  requiredString(input.review_id, 'review_id');
  requiredString(input.environment, 'environment');
  for (const name of ['flags', 'stages', 'observations', 'approvals']) {
    if (!Array.isArray(input[name])) fail(`${name} must be an array`);
  }
  if (input.flags.length === 0 || input.stages.length === 0) fail('flags and stages cannot be empty');

  const evidence = new Set();
  const addEvidence = (id, label) => {
    requiredString(id, `${label}.evidence_id`);
    if (!SHA256.test(id)) fail(`${label}.evidence_id must be a lower-case SHA-256`);
    if (evidence.has(id)) fail(`duplicate evidence_id: ${id}`);
    evidence.add(id);
  };

  for (const [index, flag] of input.flags.entries()) {
    if (!isObject(flag)) fail(`flags[${index}] must be an object`);
    requiredString(flag.key, `flags[${index}].key`);
    if (flag.environment !== input.environment) fail(`flags[${index}] mixes environments`);
    if (!Number.isInteger(flag.rollout_percent) || flag.rollout_percent < 0 || flag.rollout_percent > 100) fail(`flags[${index}].rollout_percent must be 0..100`);
    addEvidence(flag.evidence_id, `flags[${index}]`);
  }

  const stageIds = new Set();
  let previousPercent = -1;
  for (const [index, stage] of input.stages.entries()) {
    if (!isObject(stage)) fail(`stages[${index}] must be an object`);
    requiredString(stage.stage_id, `stages[${index}].stage_id`);
    if (stageIds.has(stage.stage_id)) fail(`duplicate stage_id: ${stage.stage_id}`);
    stageIds.add(stage.stage_id);
    if (!Number.isInteger(stage.target_percent) || stage.target_percent < 0 || stage.target_percent > 100) fail(`stages[${index}].target_percent must be 0..100`);
    if (stage.target_percent < previousPercent) fail(`stages[${index}] rolls percentage backwards`);
    previousPercent = stage.target_percent;
    if (!Number.isInteger(stage.observation_window_minutes) || stage.observation_window_minutes <= 0) fail(`stages[${index}].observation_window_minutes must be positive`);
    requiredString(stage.stop_rule, `stages[${index}].stop_rule`);
    requiredString(stage.rollback_owner_role, `stages[${index}].rollback_owner_role`);
    addEvidence(stage.evidence_id, `stages[${index}]`);
  }

  for (const [index, observation] of input.observations.entries()) {
    if (!isObject(observation)) fail(`observations[${index}] must be an object`);
    if (!stageIds.has(observation.stage_id)) fail(`observations[${index}] references unknown stage`);
    if (observation.status !== 'recorded_not_decided' && observation.status !== 'not_observed') fail(`observations[${index}].status is not allowed`);
    requiredString(observation.source_label, `observations[${index}].source_label`);
    addEvidence(observation.evidence_id, `observations[${index}]`);
  }

  for (const [index, approval] of input.approvals.entries()) {
    if (!isObject(approval)) fail(`approvals[${index}] must be an object`);
    requiredString(approval.role, `approvals[${index}].role`);
    requiredString(approval.scope, `approvals[${index}].scope`);
    addEvidence(approval.evidence_id, `approvals[${index}]`);
  }

  for (const value of Object.values(input)) {
    if (typeof value === 'string' && SENSITIVE.test(value)) fail('sensitive text is not allowed');
  }
  const serialized = JSON.stringify(input);
  if (SENSITIVE.test(serialized)) fail('sensitive text is not allowed');
  if (/\b(release succeeded|safe to roll out|approved for full rollout)\b/i.test(serialized)) fail('success or rollout-decision wording is not allowed');
  return { review_id: input.review_id, environment: input.environment, evidence_count: evidence.size, status: 'VALID_FOR_HUMAN_REVIEW_ONLY' };
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const file = process.argv[2];
  if (!file) fail('usage: node validate-rollout-review.mjs <review.json>');
  const result = validateRolloutReview(JSON.parse(fs.readFileSync(file, 'utf8')));
  console.log(`VALID ${result.review_id} / ${result.environment} / ${result.evidence_count} evidence items / human review only`);
}
