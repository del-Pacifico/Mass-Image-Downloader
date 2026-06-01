import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateExtension } from "../scripts/validate-extension.mjs";
import { isAllowedImageFormat, isDirectImageUrl, splitUrlFileName } from "../scripts/utils.js";

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

test("query-parameter image URLs are accepted by shared validation helpers", async () => {
  const twitterUrl = "https://pbs.twimg.com/media/Gawjed0XQAAk4JW?format=jpg&name=medium";
  const resizedUrl = "https://i0.wp.com/example.com/3077123h.jpg?resize=320&w=320";

  const twitterParts = splitUrlFileName(twitterUrl);
  const resizedParts = splitUrlFileName(resizedUrl);

  assert.equal(twitterParts.baseName, "Gawjed0XQAAk4JW");
  assert.equal(twitterParts.extension, ".jpg");
  assert.equal(resizedParts.baseName, "3077123h");
  assert.equal(resizedParts.extension, ".jpg");

  assert.equal(await isDirectImageUrl(twitterUrl), true);
  assert.equal(await isAllowedImageFormat(twitterUrl), true);
  assert.equal(await isDirectImageUrl(resizedUrl), true);
  assert.equal(await isAllowedImageFormat(resizedUrl), true);
});
