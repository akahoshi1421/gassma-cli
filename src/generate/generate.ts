import fs from "fs";
import path from "path";
import { generater } from "./generator";
import { yamlReader } from "./read/yamlReader";
import { writer } from "./writer";

function generate(fileName?: string) {
  // デフォルトは ./gassma/schema.yml を探す
  let targetPath: string;
  
  if (fileName) {
    // ファイル名が指定された場合はそのまま使用
    targetPath = fileName;
  } else {
    // デフォルトは ./gassma/schema.yml を優先、なければ ./schema.yml
    const gassmaPath = path.join("./gassma", "schema.yml");
    const rootPath = "./schema.yml";
    
    if (fs.existsSync(gassmaPath)) {
      targetPath = gassmaPath;
      console.log(`📁 Using schema file from gassma directory: ${gassmaPath}`);
    } else if (fs.existsSync(rootPath)) {
      targetPath = rootPath;
      console.log(`📁 Using schema file from root: ${rootPath}`);
    } else {
      throw new Error("schema.yml not found. Please create either ./gassma/schema.yml or ./schema.yml");
    }
  }
  
  const jsonConverted = yamlReader(targetPath);
  const resultString = generater(jsonConverted);
  writer(resultString);
}

export { generate };
