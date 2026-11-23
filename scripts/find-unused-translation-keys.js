// Lists translation keys in locales/de.json that no source file references.
//
//   node scripts/find-unused-translation-keys.js            list unused keys
//   node scripts/find-unused-translation-keys.js --remove   also delete them from all locales
//   node scripts/find-unused-translation-keys.js --ci       GitHub warnings for unused keys and
//                                                           keys missing in a locale (never fails)
//
// A key counts as used when the source contains it as a string literal ("a.b.c", 'a.b.c'
// or `a.b.c`, e.g. in t(), i18nKey or a labelKey config), when it is a plural form
// (_plural, or _zero/_one/_two/_few/_many/_other) of such a key, or when it matches a
// key built at runtime: a template literal with placeholders anywhere
// (t(`harvests.labels.unit.${unit}`), t(`${prefix}.select_date.heading`)) or a
// "prefix." + value / value + ".suffix" concatenation.
// Templates nested in another template (`${t(`animals.types.${type}`)} (${count})`) are found
// by a separate scan of t(`...`) calls; a nested template outside a t() call is not.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

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

// Without a shell: cmd.exe on Windows keeps the quotes of quoted pathspecs, then no file matches
const sourceFiles = execFileSync(
  "git",
  ["ls-files", "--", "*.ts", "*.tsx", "*.js", "*.jsx"],
  { encoding: "utf-8" },
)
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

// Every string literal in the source, and patterns for keys built at runtime
const literals = new Set();
const dynamicKeyPatterns = [];
const KEY_CHARACTERS = "[A-Za-z0-9_.]+";
function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
for (const match of source.matchAll(/"([^"\n\\]*)"|'([^'\n\\]*)'/g)) {
  const literal = match[1] ?? match[2];
  literals.add(literal);
  // "harvests.labels." + value
  if (/^[a-z0-9_]+(\.[a-z0-9_]+)*\.$/i.test(literal)) {
    dynamicKeyPatterns.push(new RegExp(`^${escapeRegExp(literal)}`));
  }
  // value + ".heading" / "_year"
  if (/^[._][a-z0-9_]+(\.[a-z0-9_]+)*$/i.test(literal) && literal.length > 3) {
    dynamicKeyPatterns.push(new RegExp(`${escapeRegExp(literal)}$`));
  }
}
function addTemplate(template) {
  if (!template.includes("${")) {
    literals.add(template);
    return;
  }
  // `harvests.labels.unit.${unit}`, `${prefix}.select_date.heading`: every placeholder
  // stands for any key characters. The fixed text has to look like part of a key, with
  // a "." (keys are namespaced), so ids like `plots${id}` or `${locale}_title` don't count.
  const fixedParts = template.split(/\$\{[^}]*\}/);
  const fixedText = fixedParts.join("");
  if (
    !/^[A-Za-z0-9_.]*$/.test(fixedText) ||
    !/[A-Za-z0-9_]\.|\.[A-Za-z0-9_]/.test(fixedText)
  ) {
    return;
  }
  dynamicKeyPatterns.push(
    new RegExp(`^${fixedParts.map(escapeRegExp).join(KEY_CHARACTERS)}$`),
  );
}
// Backticks are paired naively, so a template nested in another one splits into wrong pieces.
// The t(`...`) scan below starts at the inner backtick and catches the nested keys.
for (const match of source.matchAll(/`([^`]*)`/g)) {
  addTemplate(match[1]);
}
for (const match of source.matchAll(/\bt\(\s*`([^`]*)`/g)) {
  addTemplate(match[1]);
}

function isUsed(key) {
  const pluralBase = key.replace(PLURAL_SUFFIX, "");
  for (const candidate of [key, pluralBase]) {
    if (literals.has(candidate)) return true;
    if (dynamicKeyPatterns.some((pattern) => pattern.test(candidate))) {
      return true;
    }
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
