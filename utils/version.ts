// Numeric dotted versions only ("1.0.7", "v1.2", "1.0.8-beta"). Prerelease and
// build suffixes are dropped, missing segments count as 0.
export function parseVersion(version: string): number[] {
  return version
    .trim()
    .replace(/^v/i, "")
    .split(/[-+]/)[0]
    .split(".")
    .map((segment) => {
      const n = parseInt(segment, 10);
      return Number.isNaN(n) ? 0 : n;
    });
}

export function compareVersions(a: string, b: string): -1 | 0 | 1 {
  const left = parseVersion(a);
  const right = parseVersion(b);
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i++) {
    const l = left[i] ?? 0;
    const r = right[i] ?? 0;
    if (l > r) return 1;
    if (l < r) return -1;
  }
  return 0;
}

export function isNewerVersion(candidate: string, current: string) {
  return compareVersions(candidate, current) > 0;
}
