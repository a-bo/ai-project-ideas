#!/usr/bin/env node
import { collectProfile, GitHubApiError } from "./collector.mjs";

const username = process.argv[2];

try {
  const snapshot = await collectProfile({
    username,
    token: process.env.GITHUB_TOKEN
  });
  process.stdout.write(`${JSON.stringify(snapshot, null, 2)}\n`);
} catch (error) {
  const payload = error instanceof GitHubApiError
    ? { error: error.code, message: error.message, ...error.details }
    : { error: "unexpected_error", message: error.message };
  process.stderr.write(`${JSON.stringify(payload, null, 2)}\n`);
  process.exitCode = 1;
}
