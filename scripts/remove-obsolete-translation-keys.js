const fs = require("fs");
const path = require("path");

function loadJson(filePath) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  const content = fs.readFileSync(absolutePath, "utf-8");
  return JSON.parse(content);
}

function stripExtraKeys(template, target) {
  const cleaned = {};

  for (const key of Object.keys(template)) {
    if (key in target) {
      if (
        typeof template[key] === "object" &&
        template[key] !== null &&
        typeof target[key] === "object" &&
        target[key] !== null
      ) {
        cleaned[key] = stripExtraKeys(template[key], target[key]);
      } else {
        cleaned[key] = target[key];
      }
    }
  }

  return cleaned;
}

function generatedCleanedUpFile(template, targets, outputPath) {
  targets.forEach((target, index) => {
    const cleanedUp = stripExtraKeys(template, target);
    if (Object.keys(cleanedUp).length > 0) {
      const filePath = outputPath.replace("{index}", `${index}`);
      fs.writeFileSync(filePath, JSON.stringify(cleanedUp, null, 2), "utf-8");
    } else {
      console.log(`✅ Object at index ${index} has no obsolete keys.`);
    }
  });
}

const de = loadJson("./locales/de.json");
const targets = [
  loadJson("./locales/en.json"),
  loadJson("./locales/it.json"),
  loadJson("./locales/fr.json"),
];

generatedCleanedUpFile(de, targets, "./cleaned_up_keys_{index}.json");
