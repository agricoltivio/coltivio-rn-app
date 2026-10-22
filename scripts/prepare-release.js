// Prepares the next store release: bumps the version in app.config.js.
// Release notes and the update banner data live in coltivio-landing
// (`pnpm release <version>` there), the app only links to the website.
//
//   yarn release:prepare          # patch bump, e.g. 1.0.7 -> 1.0.8
//   yarn release:prepare 1.1.0    # explicit version

const fs = require("fs");
const path = require("path");

const appConfigPath = path.resolve(__dirname, "..", "app.config.js");
const SEMVER = /^\d+\.\d+\.\d+$/;

function fail(message) {
  console.error(message);
  process.exit(1);
}

function compareVersions(a, b) {
  const left = a.split(".").map(Number);
  const right = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (left[i] !== right[i]) return left[i] > right[i] ? 1 : -1;
  }
  return 0;
}

const appConfig = fs.readFileSync(appConfigPath, "utf-8");
const versionMatch = appConfig.match(/^(\s*version: ")(\d+\.\d+\.\d+)(",)$/m);
if (!versionMatch) fail("Could not find version in app.config.js");
const currentVersion = versionMatch[2];

const requested = process.argv[2];
let nextVersion;
if (requested) {
  if (!SEMVER.test(requested)) fail("Version must be x.y.z");
  if (compareVersions(requested, currentVersion) <= 0) {
    fail(`${requested} is not newer than the current ${currentVersion}`);
  }
  nextVersion = requested;
} else {
  const [major, minor, patch] = currentVersion.split(".").map(Number);
  nextVersion = `${major}.${minor}.${patch + 1}`;
}

fs.writeFileSync(
  appConfigPath,
  appConfig.replace(
    versionMatch[0],
    `${versionMatch[1]}${nextVersion}${versionMatch[3]}`,
  ),
);

console.log(`Version ${currentVersion} -> ${nextVersion} in app.config.js`);
console.log("");
console.log("Next steps:");
console.log("  1. Build and submit with EAS.");
console.log(
  `  2. In coltivio-landing: pnpm release ${nextVersion}, fill in the notes, merge once the store rollout is live.`,
);
