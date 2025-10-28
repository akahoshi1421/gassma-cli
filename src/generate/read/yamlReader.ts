import fs from "fs";
import path from "path";
import { load } from "js-yaml";

function yamlReader(filePath: string) {
  // パスをそのまま使用（generate.tsで処理済み）
  if (!fs.existsSync(filePath))
    throw new Error(`YAML file not found: ${filePath}`);
  
  const yamlText = fs.readFileSync(filePath, "utf-8");
  const config = load(yamlText) as Record<string, Record<string, unknown[]>>;

  return config;
}

export { yamlReader };
