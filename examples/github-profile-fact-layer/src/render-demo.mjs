#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { renderProfileDraft } from "./profile-renderer.mjs";

const fixture = JSON.parse(
  await readFile(new URL("../fixtures/render-demo.json", import.meta.url), "utf8")
);
const result = renderProfileDraft(fixture);

if (process.argv.includes("--review")) {
  process.stdout.write(`${JSON.stringify(result.review, null, 2)}\n`);
} else {
  process.stdout.write(result.markdown);
}
