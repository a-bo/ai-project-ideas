import { validateGeneratedOutput } from "./output-validator.mjs";

function singleLine(value) {
  return String(value ?? "").replace(/[\r\n]+/g, " ").replaceAll("<", "&lt;").replaceAll(">", "&gt;").trim();
}

function repositoryEvidenceId(name) {
  return `repo.${name}`;
}

export function collectEvidenceIds(snapshot) {
  return [
    "profile.public",
    ...(snapshot.repositories ?? []).map((repository) => repositoryEvidenceId(repository.name)),
    ...(snapshot.conflicts ?? []).map((conflict) => conflict.id)
  ];
}

export function renderProfileDraft({ snapshot, generated, maxProjects = 3 }) {
  if (!snapshot?.profile?.login) throw new TypeError("snapshot.profile.login is required");

  const validation = validateGeneratedOutput(generated, {
    knownEvidenceIds: collectEvidenceIds(snapshot)
  });
  if (!validation.valid) {
    throw new TypeError(`generated output failed validation: ${validation.errors.join("; ")}`);
  }

  const login = singleLine(snapshot.profile.login);
  const displayName = singleLine(snapshot.profile.name) || login;
  const bio = singleLine(snapshot.profile.bio) || "公开 Bio 暂缺，以下草稿仅基于可核验的公开仓库事实。";
  const repositories = new Map((snapshot.repositories ?? []).map((repository) => [repository.name, repository]));
  const conflictedRepositories = new Map(
    (snapshot.conflicts ?? []).map((conflict) => [conflict.repository, conflict])
  );
  const selected = (snapshot.candidates ?? [])
    .map((candidate) => repositories.get(candidate.repository))
    .filter(Boolean)
    .slice(0, Math.max(0, maxProjects));

  const lines = [
    `# Hi, I'm ${displayName}`,
    "",
    `> ${bio}`,
    "",
    "## 我关注的方向",
    ""
  ];

  if (generated.inferences.length) {
    for (const inference of generated.inferences) lines.push(`- ${singleLine(inference.text)}`);
  } else {
    lines.push("- 暂无通过证据校验的定位推断。", "");
  }

  lines.push("", "## 精选项目候选", "");
  lines.push("> 当前 Pinned 项未核验；以下顺序来自公开仓库事实层，不代表 GitHub 主页现有 Pinned 配置。", "");

  if (!selected.length) {
    lines.push("暂无满足条件的本人公开仓库。", "");
  }

  const omittedConflicts = [];
  for (const repository of selected) {
    lines.push(`### [${singleLine(repository.name)}](https://github.com/${login}/${encodeURIComponent(repository.name)})`, "");
    const conflict = conflictedRepositories.get(repository.name);
    if (conflict) {
      omittedConflicts.push({ repository: repository.name, conflict_id: conflict.id });
      lines.push("该仓库存在待核对的公开数量表述，草稿已省略仓库描述。", "");
    } else if (repository.description) {
      lines.push(singleLine(repository.description), "");
    } else {
      lines.push("仓库描述暂缺，可在发布前补充一句可核验的价值说明。", "");
    }
  }

  lines.push(
    "## 数据说明",
    "",
    `- 公开数据快照：${singleLine(snapshot.observed_at) || "未知"}`,
    "- 本草稿不读取私有仓库，也不会修改 GitHub Bio、Pinned 或 README。",
    "- 发布前仍需人工核对定位文案、仓库顺序和冲突项。",
    ""
  );

  return {
    markdown: `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`,
    review: {
      observed_at: snapshot.observed_at ?? null,
      pinned_items_verified: snapshot.collection_limits?.pinned_items_available === true,
      omitted_conflicts: omittedConflicts,
      recommendations: generated.recommendations
    }
  };
}
