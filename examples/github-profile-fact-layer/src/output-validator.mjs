const CONFIDENCE = new Set(["low", "medium", "high"]);

/**
 * A deliberately small JSON-Schema-shaped contract for the untrusted model
 * boundary. Keeping it local and dependency-free makes this example runnable
 * on Node.js 18 without presenting an LLM integration that does not exist.
 */
export const GENERATED_OUTPUT_SCHEMA = {
  type: "object",
  required: ["inferences", "recommendations"],
  properties: {
    inferences: { type: "array", items: { required: ["id", "text", "evidence_ids", "confidence"] } },
    recommendations: { type: "array", items: { required: ["id", "text", "because"] } }
  },
  additionalProperties: false
};

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function stringList(value) {
  return Array.isArray(value) && value.length > 0 && value.every(isNonEmptyString);
}

export function validateGeneratedOutput(value, { knownEvidenceIds = [] } = {}) {
  const errors = [];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { valid: false, errors: ["output must be a JSON object"] };
  }
  for (const key of Object.keys(value)) {
    if (!(key in GENERATED_OUTPUT_SCHEMA.properties)) errors.push(`unexpected field: ${key}`);
  }
  if (!Array.isArray(value.inferences)) errors.push("inferences must be an array");
  if (!Array.isArray(value.recommendations)) errors.push("recommendations must be an array");
  const evidence = new Set(knownEvidenceIds);
  for (const [index, item] of (value.inferences ?? []).entries()) {
    if (!item || typeof item !== "object") { errors.push(`inferences[${index}] must be an object`); continue; }
    if (!isNonEmptyString(item.id)) errors.push(`inferences[${index}].id must be a non-empty string`);
    if (!isNonEmptyString(item.text)) errors.push(`inferences[${index}].text must be a non-empty string`);
    if (!stringList(item.evidence_ids)) errors.push(`inferences[${index}].evidence_ids must be a non-empty string array`);
    if (!CONFIDENCE.has(item.confidence)) errors.push(`inferences[${index}].confidence must be low, medium, or high`);
    for (const id of item.evidence_ids ?? []) if (evidence.size && !evidence.has(id)) errors.push(`inferences[${index}] cites unknown evidence: ${id}`);
  }
  for (const [index, item] of (value.recommendations ?? []).entries()) {
    if (!item || typeof item !== "object") { errors.push(`recommendations[${index}] must be an object`); continue; }
    if (!isNonEmptyString(item.id)) errors.push(`recommendations[${index}].id must be a non-empty string`);
    if (!isNonEmptyString(item.text)) errors.push(`recommendations[${index}].text must be a non-empty string`);
    if (!stringList(item.because)) errors.push(`recommendations[${index}].because must be a non-empty string array`);
    for (const id of item.because ?? []) if (evidence.size && !evidence.has(id)) errors.push(`recommendations[${index}] cites unknown evidence: ${id}`);
  }
  return { valid: errors.length === 0, errors };
}

export async function resolveGeneratedOutput({ generate, knownEvidenceIds = [] }) {
  if (typeof generate !== "function") throw new TypeError("generate must be a function");
  const attempts = [];
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const candidate = await generate({ attempt, schema: GENERATED_OUTPUT_SCHEMA });
    const validation = validateGeneratedOutput(candidate, { knownEvidenceIds });
    attempts.push({ attempt, valid: validation.valid, errors: validation.errors });
    if (validation.valid) return { status: "valid", output: candidate, attempts };
  }
  return {
    status: "fallback",
    output: {
      inferences: [],
      recommendations: [],
      manual_template: "事实快照已收集；模型输出未通过校验，请依据证据 ID 人工补充推断和建议。"
    },
    attempts
  };
}
