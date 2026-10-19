import assert from "node:assert/strict";
import test from "node:test";
import { renderProfileDraft } from "../src/profile-renderer.mjs";

function fixture() {
  return {
    snapshot: {
      observed_at: "2026-09-28T09:30:00Z",
      profile: { login: "a-bo", name: "a-bo", bio: "AI builder" },
      repositories: [
        { name: "ai-project-ideas", description: "100+ practical AI ideas" },
        { name: "awesome-embodied-ai-cn", description: "中文具身智能资源库" }
      ],
      candidates: [
        { repository: "ai-project-ideas", total: 80 },
        { repository: "awesome-embodied-ai-cn", total: 72 }
      ],
      conflicts: [
        { id: "conflict.plus_count.ai-project-ideas", repository: "ai-project-ideas" }
      ],
      collection_limits: { pinned_items_available: false }
    },
    generated: {
      inferences: [
        {
          id: "positioning",
          text: "公开内容聚焦 AI 项目与具身智能。",
          evidence_ids: ["repo.ai-project-ideas", "repo.awesome-embodied-ai-cn"],
          confidence: "medium"
        }
      ],
      recommendations: [
        {
          id: "sync-copy",
          text: "统一数量表述。",
          because: ["conflict.plus_count.ai-project-ideas"]
        }
      ]
    }
  };
}

test("renders an auditable Markdown draft from schema-valid output", () => {
  const result = renderProfileDraft(fixture());
  assert.match(result.markdown, /# Hi, I'm a-bo/);
  assert.match(result.markdown, /公开内容聚焦 AI 项目与具身智能/);
  assert.match(result.markdown, /awesome-embodied-ai-cn/);
  assert.match(result.markdown, /2026-09-28T09:30:00Z/);
});

test("omits a conflicted repository description from publishable Markdown", () => {
  const result = renderProfileDraft(fixture());
  assert.doesNotMatch(result.markdown, /100\+/);
  assert.deepEqual(result.review.omitted_conflicts, [
    {
      repository: "ai-project-ideas",
      conflict_id: "conflict.plus_count.ai-project-ideas"
    }
  ]);
});

test("keeps unverified Pinned state explicit", () => {
  const result = renderProfileDraft(fixture());
  assert.equal(result.review.pinned_items_verified, false);
  assert.match(result.markdown, /当前 Pinned 项未核验/);
});

test("rejects generated text that cites unknown evidence", () => {
  const input = fixture();
  input.generated.inferences[0].evidence_ids = ["repo.unknown"];
  assert.throws(
    () => renderProfileDraft(input),
    /generated output failed validation:.*unknown evidence/
  );
});
