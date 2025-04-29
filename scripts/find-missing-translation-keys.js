const fs = require("fs");
const path = require("path");

function loadJson(filePath) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  const content = fs.readFileSync(absolutePath, "utf-8");
  return JSON.parse(content);
}

function findMissingKeysAndValues(template, target) {
  let missing = {};

  for (const key of Object.keys(template)) {
    if (!(key in target)) {
      // If key is missing, copy value from template
      missing[key] = template[key];
    } else if (typeof template[key] === "object" && template[key] !== null) {
      if (typeof target[key] !== "object" || target[key] === null) {
        missing[key] = template[key];
      } else {
        const childMissing = findMissingKeysAndValues(
          template[key],
          target[key]
        );
        if (Object.keys(childMissing).length > 0) {
          missing[key] = childMissing;
        }
      }
    }
  }

  return missing;
}

function generateMissingKeysFile(template, targets, outputPath) {
  targets.forEach((target, index) => {
    const missing = findMissingKeysAndValues(template, target);
    if (Object.keys(missing).length > 0) {
      const filePath = outputPath.replace("{index}", `${index}`);
      fs.writeFileSync(filePath, JSON.stringify(missing, null, 2), "utf-8");
      console.log(
        `📝 Missing keys for object at index ${index} written to ${filePath}`
      );
    } else {
      console.log(`✅ Object at index ${index} has all required keys.`);
    }
  });
}

const de = loadJson("./locales/de.json");
const targets = [
  loadJson("./locales/en.json"),
  loadJson("./locales/it.json"),
  loadJson("./locales/fr.json"),
];

generateMissingKeysFile(de, targets, "./missing_keys_{index}.json");
