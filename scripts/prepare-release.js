// Prepares the next store release: bumps the version in app.config.js and adds
// a release notes template to features/release-notes/release-notes.ts.
//
//   yarn release:prepare          # patch bump, e.g. 1.0.7 -> 1.0.8
//   yarn release:prepare 1.1.0    # explicit version

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const appConfigPath = path.join(root, "app.config.js");
const releaseNotesPath = path.join(
  root,
  "features",
  "release-notes",
  "release-notes.ts",
);
const MARKER = "// release:prepare inserts new entries below this line";
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

const releaseNotes = fs.readFileSync(releaseNotesPath, "utf-8");
if (!releaseNotes.includes(MARKER)) {
  fail(`Marker line missing in release-notes.ts: ${MARKER}`);
}
if (releaseNotes.includes(`version: "${nextVersion}"`)) {
  fail(`release-notes.ts already has an entry for ${nextVersion}`);
}

const entry = [
  "  {",
  `    version: "${nextVersion}",`,
  "    notes: {",
  "      de: `TODO`,",
  "      fr: `TODO`,",
  "      it: `TODO`,",
  "      en: `TODO`,",
  "    },",
  "  },",
].join("\n");

fs.writeFileSync(
  appConfigPath,
  appConfig.replace(
    versionMatch[0],
    `${versionMatch[1]}${nextVersion}${versionMatch[3]}`,
  ),
);
fs.writeFileSync(
  releaseNotesPath,
  releaseNotes.replace(MARKER, `${MARKER}\n${entry}`),
);

console.log(`Version ${currentVersion} -> ${nextVersion}`);
console.log(`  app.config.js updated`);
console.log(
  `  template entry added to features/release-notes/release-notes.ts`,
);
console.log("");
console.log("Next steps:");
console.log("  1. Replace the TODO notes in all four languages (markdown).");
console.log("  2. yarn test:ci --testPathPattern=release-notes");
console.log("  3. Build and submit with EAS.");
console.log(`  4. In coltivio-api: yarn release:app ${nextVersion}`);
