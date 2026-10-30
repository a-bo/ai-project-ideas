const ID = /^[A-Z][A-Z0-9_]{1,31}$/;
const VERSION = /^[0-9]+(?:\.[0-9]+){1,2}(?:[-+][0-9A-Za-z.-]+)?$/;
const RELATIVE_PATH = /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[A-Za-z0-9._/-]+$/;

function fail(message) { throw new Error(message); }
function object(value, label) {
  if (!value || Array.isArray(value) || typeof value !== 'object') fail(`${label} must be an object`);
  return value;
}
function exactKeys(value, allowed, label) {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) fail(`${label}.${key} is not allowed`);
}
function requiredString(value, key, label, pattern) {
  if (typeof value[key] !== 'string' || !value[key].trim()) fail(`${label}.${key} is required`);
  if (pattern && !pattern.test(value[key])) fail(`${label}.${key} is invalid`);
}

export function validateUpgradeRecord(input) {
  const record = object(input, 'record');
  exactKeys(record, ['upgrade_id', 'intent', 'evidence', 'claims', 'checks', 'decision'], 'record');
  for (const key of ['upgrade_id', 'intent', 'evidence', 'claims', 'checks', 'decision']) if (!(key in record)) fail(`record.${key} is required`);
  requiredString(record, 'upgrade_id', 'record', /^upg_[0-9]{8}_[0-9]{3}$/);
  if (!['needs_human_review', 'ready_for_execution', 'blocked'].includes(record.decision)) fail('record.decision is invalid');

  const intent = object(record.intent, 'intent');
  exactKeys(intent, ['package', 'from', 'to', 'ecosystem'], 'intent');
  for (const key of ['package', 'from', 'to', 'ecosystem']) requiredString(intent, key, 'intent', key === 'from' || key === 'to' ? VERSION : undefined);
  if (!['npm'].includes(intent.ecosystem)) fail('intent.ecosystem is unsupported');
  if (intent.from === intent.to) fail('intent.to must differ from intent.from');

  if (!Array.isArray(record.evidence) || !record.evidence.length) fail('record.evidence must be a non-empty array');
  const evidenceIds = new Set();
  for (const [index, item] of record.evidence.entries()) {
    const label = `evidence[${index}]`; object(item, label);
    exactKeys(item, ['id', 'kind', 'path', 'sha256', 'observed_at', 'line', 'symbol'], label);
    for (const key of ['id', 'kind', 'path', 'sha256', 'observed_at']) requiredString(item, key, label);
    if (!ID.test(item.id) || evidenceIds.has(item.id)) fail(`${label}.id must be unique and valid`);
    if (!['manifest', 'lockfile', 'ci_config', 'usage_match', 'release_note'].includes(item.kind)) fail(`${label}.kind is invalid`);
    if (!RELATIVE_PATH.test(item.path)) fail(`${label}.path must be relative`);
    if (!/^[a-f0-9]{64}$/.test(item.sha256)) fail(`${label}.sha256 is invalid`);
    if (Number.isNaN(Date.parse(item.observed_at))) fail(`${label}.observed_at is invalid`);
    if (item.line !== undefined && (!Number.isInteger(item.line) || item.line < 1)) fail(`${label}.line is invalid`);
    if (item.symbol !== undefined && (typeof item.symbol !== 'string' || !item.symbol)) fail(`${label}.symbol is invalid`);
    evidenceIds.add(item.id);
  }

  if (!Array.isArray(record.claims)) fail('record.claims must be an array');
  for (const [index, claim] of record.claims.entries()) {
    const label = `claims[${index}]`; object(claim, label); exactKeys(claim, ['id', 'statement', 'evidence_ids', 'status'], label);
    requiredString(claim, 'id', label, ID); requiredString(claim, 'statement', label);
    if (!['observed', 'review', 'unknown'].includes(claim.status)) fail(`${label}.status is invalid`);
    if (!Array.isArray(claim.evidence_ids) || !claim.evidence_ids.length) fail(`${label}.evidence_ids is required`);
    for (const evidenceId of claim.evidence_ids) if (!evidenceIds.has(evidenceId)) fail(`${label}.evidence_ids contains unknown ID`);
  }

  if (!Array.isArray(record.checks) || !record.checks.length) fail('record.checks must be a non-empty array');
  for (const [index, check] of record.checks.entries()) {
    const label = `checks[${index}]`; object(check, label); exactKeys(check, ['id', 'command', 'status', 'required_for_merge', 'exit_code', 'log_path'], label);
    requiredString(check, 'id', label, ID); requiredString(check, 'command', label);
    if (!['not_run', 'passed', 'failed'].includes(check.status)) fail(`${label}.status is invalid`);
    if (typeof check.required_for_merge !== 'boolean') fail(`${label}.required_for_merge is required`);
    if (check.status === 'not_run' && ('exit_code' in check || 'log_path' in check)) fail(`${label} must not attach run data before execution`);
    if (check.status !== 'not_run') {
      if (!Number.isInteger(check.exit_code) || !RELATIVE_PATH.test(check.log_path || '')) fail(`${label} must include a relative log_path and integer exit_code`);
      if ((check.status === 'passed') !== (check.exit_code === 0)) fail(`${label}.status conflicts with exit_code`);
    }
  }
  return { valid: true, evidence_count: evidenceIds.size, claim_count: record.claims.length, check_count: record.checks.length };
}
