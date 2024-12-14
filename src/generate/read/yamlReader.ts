import fs from "fs";
import { load } from "js-yaml";

function yamlReader(fileName: string) {
  const path = `./${fileName}`;
  const yamlText = fs.readFileSync(path, "utf-8");
  const config = load(yamlText) as Record<string, unknown>;

  return config;
}

export { yamlReader };
