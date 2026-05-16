// Bumps the app version in package.json, src-tauri/Cargo.toml and
// src-tauri/tauri.conf.json so the three stay in sync.
//
// Usage:
//   npm run version:bump            -> patch  (2.0.2 -> 2.0.3)
//   npm run version:bump -- minor   -> minor  (2.0.2 -> 2.1.0)
//   npm run version:bump -- major   -> major  (2.0.2 -> 3.0.0)
//   npm run version:bump -- 4.1.0   -> explicit version

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const pkgPath = path.join(root, "package.json");
const cargoPath = path.join(root, "src-tauri", "Cargo.toml");
const confPath = path.join(root, "src-tauri", "tauri.conf.json");

const SEMVER = /^\d+\.\d+\.\d+$/;

function computeNext(current, arg) {
  if (SEMVER.test(arg)) return arg;
  const [major, minor, patch] = current.split(".").map(Number);
  switch (arg) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
    case undefined:
      return `${major}.${minor}.${patch + 1}`;
    default:
      console.error(`Invalid argument "${arg}". Use major|minor|patch or X.Y.Z`);
      process.exit(1);
  }
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const current = pkg.version;
if (!SEMVER.test(current)) {
  console.error(`Cannot parse current version "${current}" in package.json`);
  process.exit(1);
}

const next = computeNext(current, process.argv[2]);

// package.json: preserve the file's existing indentation/formatting.
fs.writeFileSync(
  pkgPath,
  fs
    .readFileSync(pkgPath, "utf8")
    .replace(/("version":\s*")\d+\.\d+\.\d+(")/, `$1${next}$2`)
);

// Cargo.toml: only the [package] version (first line-anchored `version = "..."`).
fs.writeFileSync(
  cargoPath,
  fs
    .readFileSync(cargoPath, "utf8")
    .replace(/^version = "\d+\.\d+\.\d+"/m, `version = "${next}"`)
);

// tauri.conf.json: top-level "version".
fs.writeFileSync(
  confPath,
  fs
    .readFileSync(confPath, "utf8")
    .replace(/("version":\s*")\d+\.\d+\.\d+(")/, `$1${next}$2`)
);

console.log(`Version bumped: ${current} -> ${next}`);
console.log("  package.json");
console.log("  src-tauri/Cargo.toml");
console.log("  src-tauri/tauri.conf.json");
