// Lists translation keys in locales/de.json that no source file references.
//
//   node scripts/find-unused-translation-keys.js            list unused keys
//   node scripts/find-unused-translation-keys.js --remove   also delete them from all locales
//   node scripts/find-unused-translation-keys.js --ci       GitHub warnings for unused keys and
//                                                           keys missing in a locale (never fails)
//
// A key counts as used when the source contains it as a string literal ("a.b.c", 'a.b.c'
// or `a.b.c`, e.g. in t(), i18nKey or a labelKey config), when it is a plural form
// (_plural, or _zero/_one/_two/_few/_many/_other) of such a key, or when it starts with the static
// part of a template literal key (t(`harvests.labels.unit.${unit}`) keeps every key under
// harvests.labels.unit.) or of a "prefix." + value concatenation.
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const LOCALES = ["de", "en", "fr", "it"];
// i18next v3 JSON (compatibilityJSON: "v3"): key_plural; newer: key_one, key_other, ...
const PLURAL_SUFFIX = /_(plural|zero|one|two|few|many|other)$/;

function loadLocale(locale) {
  return JSON.parse(
    fs.readFileSync(path.join("locales", `${locale}.json`), "utf-8"),
  );
}

// { a: { b: "x" } } -> ["a.b"]
function flattenKeys(translations, prefix = "") {
  return Object.entries(translations).flatMap(([key, value]) =>
    typeof value === "object" && value !== null
      ? flattenKeys(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

function removeKey(translations, keyPath) {
  const [first, ...rest] = keyPath.split(".");
  if (!(first in translations)) return;
  if (rest.length === 0) {
    delete translations[first];
    return;
  }
  removeKey(translations[first], rest.join("."));
  // Drop sections that became empty
  if (Object.keys(translations[first]).length === 0) delete translations[first];
}

const sourceFiles = execSync("git ls-files -- '*.ts' '*.tsx' '*.js' '*.jsx'", {
  encoding: "utf-8",
})
  .split("\n")
  .filter(
    (file) =>
      file &&
      !file.startsWith("scripts/") &&
      !file.startsWith("locales/") &&
      fs.existsSync(file),
  );
const source = sourceFiles
  .map((file) => fs.readFileSync(file, "utf-8"))
  .join("\n");

// Every string literal in the source, and the static start of dynamic ones
const literals = new Set();
const dynamicPrefixes = new Set();
for (const match of source.matchAll(/"([^"\n\\]*)"|'([^'\n\\]*)'/g)) {
  const literal = match[1] ?? match[2];
  literals.add(literal);
  // "harvests.labels." + value
  if (/^[a-z0-9_]+(\.[a-z0-9_]+)*\.$/i.test(literal)) {
    dynamicPrefixes.add(literal);
  }
}
for (const match of source.matchAll(/`([^`]*)`/g)) {
  const template = match[1];
  const placeholderIndex = template.indexOf("${");
  if (placeholderIndex === -1) {
    literals.add(template);
  } else if (placeholderIndex > 0) {
    // `harvests.labels.unit.${unit}`, also `prefix_${x}`
    dynamicPrefixes.add(template.slice(0, placeholderIndex));
  }
}

function isUsed(key) {
  if (literals.has(key)) return true;
  const pluralBase = key.replace(PLURAL_SUFFIX, "");
  if (pluralBase !== key && literals.has(pluralBase)) return true;
  for (const prefix of dynamicPrefixes) {
    if (prefix.includes(".") && key.startsWith(prefix)) return true;
  }
  return false;
}

const de = loadLocale("de");
const allKeys = flattenKeys(de);
const unusedKeys = allKeys.filter((key) => !isUsed(key));

const ci = process.argv.includes("--ci");
if (ci) {
  for (const key of unusedKeys) {
    console.log(
      `::warning file=locales/de.json::Unused translation key ${key}`,
    );
  }
  const deKeys = new Set(allKeys);
  for (const locale of LOCALES.filter((locale) => locale !== "de")) {
    const localeKeys = new Set(flattenKeys(loadLocale(locale)));
    for (const key of deKeys) {
      if (!localeKeys.has(key)) {
        console.log(
          `::warning file=locales/${locale}.json::Missing translation key ${key}`,
        );
      }
    }
    for (const key of localeKeys) {
      if (!deKeys.has(key)) {
        console.log(
          `::warning file=locales/${locale}.json::Translation key ${key} is not in de.json`,
        );
      }
    }
  }
  process.exit(0);
}

for (const key of unusedKeys) console.log(key);
console.log(`\n${unusedKeys.length} of ${allKeys.length} keys unused`);

if (process.argv.includes("--remove")) {
  for (const locale of LOCALES) {
    const translations = loadLocale(locale);
    for (const key of unusedKeys) removeKey(translations, key);
    fs.writeFileSync(
      path.join("locales", `${locale}.json`),
      `${JSON.stringify(translations, null, 2)}\n`,
    );
  }
  console.log(`Removed from ${LOCALES.join(", ")}`);
}
