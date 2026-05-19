import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

function readJson(relativePath) {
  const filePath = path.join(repoRoot, relativePath);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertPathExistsCaseSensitive(relativePath) {
  const normalized = relativePath.replaceAll("\\", "/").replace(/^\/+/, "");
  const parts = normalized.split("/").filter(Boolean);
  let current = repoRoot;

  for (const part of parts) {
    const entries = fs.readdirSync(current);
    assert(entries.includes(part), `Missing path or case mismatch: ${relativePath}`);
    current = path.join(current, part);
  }
}

function collectManifestPaths(manifest) {
  const paths = [];

  for (const iconPath of Object.values(manifest.icons ?? {})) {
    paths.push(iconPath);
  }

  for (const iconPath of Object.values(manifest.action?.default_icon ?? {})) {
    paths.push(iconPath);
  }

  if (manifest.action?.default_popup) {
    paths.push(manifest.action.default_popup);
  }

  if (manifest.options_page) {
    paths.push(manifest.options_page);
  }

  if (manifest.background?.service_worker) {
    paths.push(manifest.background.service_worker);
  }

  for (const contentScript of manifest.content_scripts ?? []) {
    for (const scriptPath of contentScript.js ?? []) {
      paths.push(scriptPath);
    }
  }

  for (const resourceSet of manifest.web_accessible_resources ?? []) {
    for (const resourcePath of resourceSet.resources ?? []) {
      if (resourcePath.endsWith("/*")) {
        paths.push(resourcePath.slice(0, -2));
      } else {
        paths.push(resourcePath);
      }
    }
  }

  return paths;
}

function collectHtmlScriptPaths() {
  const htmlDir = path.join(repoRoot, "html");
  const scriptPaths = [];

  for (const fileName of fs.readdirSync(htmlDir)) {
    if (!fileName.endsWith(".html")) continue;

    const htmlPath = path.join(htmlDir, fileName);
    const html = fs.readFileSync(htmlPath, "utf8");
    const matches = html.matchAll(/<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi);

    for (const match of matches) {
      const src = match[1];
      if (/^[a-z]+:\/\//i.test(src)) continue;
      const resolved = path.relative(repoRoot, path.resolve(htmlDir, src));
      scriptPaths.push(resolved.replaceAll("\\", "/"));
    }
  }

  return scriptPaths;
}

function collectJavaScriptFiles() {
  const scriptDir = path.join(repoRoot, "script");
  return fs
    .readdirSync(scriptDir)
    .filter((fileName) => fileName.endsWith(".js"))
    .map((fileName) => path.join(scriptDir, fileName));
}

export function validateExtension() {
  const manifest = readJson("manifest.json");
  const packageJson = readJson("package.json");
  const version = fs.readFileSync(path.join(repoRoot, "VERSION"), "utf8").trim();

  assert(manifest.manifest_version === 3, "manifest.json must use Manifest V3");
  assert(manifest.minimum_chrome_version === "93", "minimum_chrome_version must remain 93");
  assert(manifest.version === version, "manifest.json version must match VERSION");
  assert(packageJson.version === version, "package.json version must match VERSION");
  assert(manifest.background?.type === "module", "background service worker must be an ES module");
  assert(Object.keys(manifest.commands ?? {}).length <= 4, "manifest.json must declare no more than 4 extension commands");

  for (const requiredPermission of ["tabs", "downloads", "storage", "scripting", "clipboardRead"]) {
    assert(manifest.permissions?.includes(requiredPermission), `Missing required permission: ${requiredPermission}`);
  }

  for (const manifestPath of collectManifestPaths(manifest)) {
    assertPathExistsCaseSensitive(manifestPath);
  }

  for (const scriptPath of collectHtmlScriptPaths()) {
    assertPathExistsCaseSensitive(scriptPath);
  }

  for (const jsFile of collectJavaScriptFiles()) {
    execFileSync(process.execPath, ["--check", jsFile], { stdio: "pipe" });
  }
}

if (process.argv[1] === __filename) {
  validateExtension();
  console.log("Extension compliance checks passed.");
}
