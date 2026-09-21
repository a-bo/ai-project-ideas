const API_ROOT = "https://api.github.com";
const USERNAME_PATTERN = /^(?!-)(?!.*--)[A-Za-z0-9-]{1,39}(?<!-)$/;
const INJECTION_PATTERNS = [
  /ignore\s+(all|any|the|previous)/i,
  /system\s+prompt/i,
  /忽略.{0,12}(指令|规则|提示)/i,
  /系统提示/
];

export class GitHubApiError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "GitHubApiError";
    this.code = code;
    this.details = details;
  }
}

export function validateUsername(value) {
  const username = String(value ?? "").trim();
  if (!USERNAME_PATTERN.test(username)) {
    throw new GitHubApiError(
      "invalid_username",
      "GitHub username must be 1-39 characters and cannot start, end, or repeat a hyphen."
    );
  }
  return username;
}

function decodeReadme(payload) {
  if (!payload?.content || payload.encoding !== "base64") return "";
  return Buffer.from(payload.content.replace(/\n/g, ""), "base64").toString("utf8");
}

function sanitizeReadme(text) {
  return text
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/!\[[^\]]*\]\(data:[^)]+\)/gi, "")
    .slice(0, 6000);
}

function extractPlusCounts(text) {
  return [...String(text ?? "").matchAll(/\b(\d[\d,]*)\s*\+/g)].map((match) =>
    Number(match[1].replaceAll(",", ""))
  );
}

function freshnessScore(pushedAt, observedAt) {
  if (!pushedAt) return 0;
  const ageDays = (new Date(observedAt) - new Date(pushedAt)) / 86_400_000;
  if (ageDays <= 30) return 20;
  if (ageDays <= 90) return 14;
  if (ageDays <= 365) return 8;
  return 2;
}

function relevanceScore(repo) {
  const haystack = `${repo.name} ${repo.description ?? ""}`.toLowerCase();
  const keywords = ["ai", "llm", "agent", "robot", "developer", "tool", "github"];
  return Math.min(35, keywords.filter((word) => haystack.includes(word)).length * 7);
}

function scoreRepo(repo, readme, observedAt) {
  const relevance = relevanceScore(repo);
  const freshness = freshnessScore(repo.pushed_at, observedAt);
  const clarity = repo.description ? Math.min(15, 5 + Math.floor(repo.description.length / 12)) : 0;
  const evidenceSignals = [
    /install|安装|运行|usage|使用/i,
    /limit|限制|known issue|已知问题/i,
    /目标|problem|痛点|why/i,
    /更新|changelog|release/i
  ];
  const evidence = Math.min(30, evidenceSignals.filter((pattern) => pattern.test(readme)).length * 7.5);
  return {
    total: relevance + freshness + clarity + evidence,
    breakdown: { relevance, evidence, freshness, clarity }
  };
}

function normalizeRepo(repo, readme = null) {
  return {
    name: repo.name,
    description: repo.description,
    owner_is_subject: true,
    is_fork: Boolean(repo.fork),
    archived: Boolean(repo.archived),
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    open_issues: repo.open_issues_count ?? 0,
    pushed_at: repo.pushed_at ?? null,
    readme_excerpt: readme === null ? null : readme.slice(0, 500)
  };
}

function conflictFor(repo, readme) {
  const descriptionCounts = extractPlusCounts(repo.description);
  // Treat the README lead as the primary positioning claim. Later roadmap goals
  // such as "expand to 100+" must not cancel a conflicting current count.
  const readmeCounts = extractPlusCounts(readme.slice(0, 1000));
  if (!descriptionCounts.length || !readmeCounts.length) return null;
  if (descriptionCounts.some((value) => readmeCounts.includes(value))) return null;
  return {
    id: `conflict.plus_count.${repo.name}`,
    field: "published_plus_count",
    repository: repo.name,
    sources: [
      { location: "repository.description", values: descriptionCounts },
      { location: "repository.readme", values: readmeCounts }
    ],
    resolution: "omit_from_generated_copy",
    user_action: "Verify the underlying index and make the repository description match the README."
  };
}

function retryAt(response) {
  const reset = response.headers.get("x-ratelimit-reset");
  if (reset) return new Date(Number(reset) * 1000).toISOString();
  const retryAfter = response.headers.get("retry-after");
  if (retryAfter) return new Date(Date.now() + Number(retryAfter) * 1000).toISOString();
  return null;
}

function createRequester(fetchImpl, token) {
  return async function request(path, { missingCode } = {}) {
    const response = await fetchImpl(`${API_ROOT}${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "github-profile-fact-layer-example",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (response.ok) return response.json();
    if (response.status === 404 && missingCode) {
      throw new GitHubApiError(missingCode, `GitHub resource not found: ${path}`);
    }
    if (response.status === 403 || response.status === 429) {
      throw new GitHubApiError("rate_limited", "GitHub API rate limit reached.", {
        status: response.status,
        retry_at: retryAt(response)
      });
    }
    throw new GitHubApiError("github_api_error", `GitHub API returned ${response.status}.`, {
      status: response.status,
      path
    });
  };
}

export async function collectProfile({
  username: rawUsername,
  fetchImpl = globalThis.fetch,
  token,
  maxReadmes = 8,
  observedAt = new Date().toISOString()
}) {
  const username = validateUsername(rawUsername);
  if (typeof fetchImpl !== "function") {
    throw new GitHubApiError("fetch_unavailable", "A fetch implementation is required.");
  }
  const request = createRequester(fetchImpl, token);
  const profile = await request(`/users/${encodeURIComponent(username)}`, {
    missingCode: "user_not_found"
  });

  const rawRepos = [];
  let repositoryPagesFetched = 0;
  for (let page = 1; ; page += 1) {
    const batch = await request(
      `/users/${encodeURIComponent(username)}/repos?type=owner&sort=updated&per_page=100&page=${page}`
    );
    repositoryPagesFetched += 1;
    rawRepos.push(...batch);
    if (batch.length < 100) break;
  }

  const ownedRepos = rawRepos.filter(
    (repo) =>
      repo.owner?.login?.toLowerCase() === username.toLowerCase() &&
      !repo.fork &&
      !repo.archived &&
      repo.size !== 0
  );
  const preselected = [...ownedRepos]
    .sort((a, b) => {
      const difference =
        relevanceScore(b) + freshnessScore(b.pushed_at, observedAt) -
        (relevanceScore(a) + freshnessScore(a.pushed_at, observedAt));
      return difference || a.name.localeCompare(b.name);
    })
    .slice(0, Math.max(0, maxReadmes));

  const readmes = new Map();
  const warnings = [];
  for (const repo of preselected) {
    try {
      const payload = await request(
        `/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo.name)}/readme`,
        { missingCode: "readme_missing" }
      );
      readmes.set(repo.name, sanitizeReadme(decodeReadme(payload)));
    } catch (error) {
      if (error instanceof GitHubApiError && error.code === "readme_missing") {
        warnings.push({ code: error.code, repository: repo.name });
        readmes.set(repo.name, "");
        continue;
      }
      throw error;
    }
  }

  const conflicts = [];
  const securityEvents = [];
  const candidates = preselected.map((repo) => {
    const readme = readmes.get(repo.name) ?? "";
    const conflict = conflictFor(repo, readme);
    if (conflict) conflicts.push(conflict);
    if (INJECTION_PATTERNS.some((pattern) => pattern.test(readme))) {
      securityEvents.push({
        code: "untrusted_readme_instruction",
        repository: repo.name,
        action: "recorded_and_ignored"
      });
    }
    return {
      repository: repo.name,
      ...scoreRepo(repo, readme, observedAt)
    };
  }).sort((a, b) => b.total - a.total || a.repository.localeCompare(b.repository));

  return {
    snapshot_version: "1.0",
    observed_at: observedAt,
    profile: {
      login: profile.login,
      name: profile.name ?? null,
      bio: profile.bio ?? null,
      public_repos: profile.public_repos ?? rawRepos.length,
      followers: profile.followers ?? null
    },
    repositories: ownedRepos.map((repo) => normalizeRepo(repo, readmes.get(repo.name) ?? null)),
    candidates,
    conflicts,
    security_events: securityEvents,
    warnings,
    collection_limits: {
      public_data_only: true,
      repository_pages_fetched: repositoryPagesFetched,
      readmes_fetched: preselected.length - warnings.length,
      readme_limit: maxReadmes,
      pinned_items_available: false,
      pinned_items_note: "GraphQL pinned items are outside this fact-layer example; no current pins were inferred."
    }
  };
}
