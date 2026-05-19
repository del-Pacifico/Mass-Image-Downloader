import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateExtension } from "../scripts/validate-extension.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

test("extension compliance checks pass", () => {
  assert.doesNotThrow(() => validateExtension());
});

test("manifest, package, and VERSION stay aligned", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, "manifest.json"), "utf8"));
  const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  const version = fs.readFileSync(path.join(repoRoot, "VERSION"), "utf8").trim();

  assert.equal(manifest.version, version);
  assert.equal(packageJson.version, version);
});
