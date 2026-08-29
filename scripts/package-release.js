// Packages a Windows release into ./release-staging:
//   - syncdrome_<version>_x64_en-US.msi       (signed by `tauri build`)
//   - syncdrome_<v_with_underscores>_win_standalone.zip  (signed exe, zipped)
//
// The MSI is signed by Tauri when src-tauri/tauri.windows.conf.json provides a
// certificateThumbprint (machine-specific, gitignored). The standalone exe is
// NOT signed by Tauri, so this script signs it with signtool using that same
// thumbprint. No secrets live in this script; the thumbprint is read from the
// local (untracked) Windows config.
//
// Usage:
//   node scripts/package-release.js              full: tauri build + package
//   node scripts/package-release.js --skip-build package an existing build

const fs = require("fs");
const path = require("path");
const { execFileSync, execSync } = require("child_process");

const root = path.join(__dirname, "..");
const skipBuild = process.argv.includes("--skip-build");

const version = require(path.join(root, "package.json")).version;
const underscored = version.replace(/\./g, "_");

const releaseDir = path.join(root, "release-staging");
const targetDir = path.join(root, "src-tauri", "target", "release");
const msiSrc = path.join(
  targetDir,
  "bundle",
  "msi",
  `syncdrome_${version}_x64_en-US.msi`
);
const exeSrc = path.join(targetDir, "syncdrome.exe");
const winConf = path.join(root, "src-tauri", "tauri.windows.conf.json");

const log = (m) => console.log(`[package-release] ${m}`);

// 1. Build (signs the MSI when the local Windows signing config is present).
if (!skipBuild) {
  log(`Building Tauri release for v${version} ...`);
  execSync("npm run tauri:build", { cwd: root, stdio: "inherit" });
} else {
  log("Skipping build (--skip-build).");
}

if (!fs.existsSync(msiSrc)) {
  console.error(`[package-release] MSI not found: ${msiSrc}`);
  process.exit(1);
}
if (!fs.existsSync(exeSrc)) {
  console.error(`[package-release] Standalone exe not found: ${exeSrc}`);
  process.exit(1);
}

// 2. Sign the standalone exe (Tauri only signs the installer).
let thumbprint;
if (fs.existsSync(winConf)) {
  try {
    thumbprint = JSON.parse(fs.readFileSync(winConf, "utf8"))?.bundle?.windows
      ?.certificateThumbprint;
  } catch {
    /* ignore malformed config */
  }
}

if (thumbprint) {
  const sdkBin = "C:\\Program Files (x86)\\Windows Kits\\10\\bin";
  let signtool;
  if (fs.existsSync(sdkBin)) {
    const versions = fs
      .readdirSync(sdkBin)
      .filter((d) => /^\d/.test(d))
      .sort()
      .reverse();
    for (const v of versions) {
      const candidate = path.join(sdkBin, v, "x64", "signtool.exe");
      if (fs.existsSync(candidate)) {
        signtool = candidate;
        break;
      }
    }
  }
  if (!signtool) {
    console.error(
      "[package-release] signtool.exe not found; cannot sign the standalone exe."
    );
    process.exit(1);
  }
  log("Signing standalone syncdrome.exe ...");
  execFileSync(
    signtool,
    [
      "sign",
      "/sha1",
      thumbprint,
      "/fd",
      "sha256",
      "/td",
      "sha256",
      "/tr",
      "http://timestamp.digicert.com",
      exeSrc,
    ],
    { stdio: "inherit" }
  );
} else {
  log(
    "No certificateThumbprint in tauri.windows.conf.json - standalone exe will NOT be signed."
  );
}

// 3. Stage the artifacts.
fs.rmSync(releaseDir, { recursive: true, force: true });
fs.mkdirSync(releaseDir, { recursive: true });

const msiOut = path.join(releaseDir, `syncdrome_${version}_x64_en-US.msi`);
const zipOut = path.join(
  releaseDir,
  `syncdrome_${underscored}_win_standalone.zip`
);

fs.copyFileSync(msiSrc, msiOut);
// Compress-Archive places the file at the zip root, matching prior releases.
execFileSync(
  "powershell",
  [
    "-NoProfile",
    "-Command",
    `Compress-Archive -Path '${exeSrc}' -DestinationPath '${zipOut}' -Force`,
  ],
  { stdio: "inherit" }
);

const mb = (p) => (fs.statSync(p).size / 1024 / 1024).toFixed(2);
log(`Done. Artifacts in release-staging/:`);
log(`  ${path.basename(msiOut)}  ${mb(msiOut)} MB`);
log(`  ${path.basename(zipOut)}  ${mb(zipOut)} MB`);
log(
  `Publish with: gh release upload v${version} ` +
    `"${path.relative(root, msiOut)}" "${path.relative(root, zipOut)}" --clobber`
);
