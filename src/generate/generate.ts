import fs from "fs";
import path from "path";
import { generater } from "./generator";
import { yamlReader } from "./read/yamlReader";
import { writer } from "./writer";

function generate(customDir?: string) {
  // gassmaディレクトリ内の全YAMLファイルを処理
  const gassmaDir = customDir || "./gassma";

  if (!fs.existsSync(gassmaDir))
    throw new Error(
      `${gassmaDir}/ directory not found. Please create ${gassmaDir}/ directory with YAML files.`,
    );

  // gassmaディレクトリ内の全YAMLファイルを取得
  const yamlFiles = fs
    .readdirSync(gassmaDir)
    .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"));

  if (yamlFiles.length === 0)
    throw new Error(
      `No YAML files found in ${gassmaDir}/ directory. Please create at least one .yml or .yaml file.`,
    );

  console.log(
    `📁 Found ${yamlFiles.length} YAML file(s) in ${path.basename(gassmaDir)} directory`,
  );

  // 各YAMLファイルを処理
  yamlFiles.forEach((file) => {
    const filePath = path.join(gassmaDir, file);
    console.log(`  📄 Processing: ${file}`);

    const jsonConverted = yamlReader(filePath);
    const resultString = generater(jsonConverted);
    const baseName = path.basename(file, path.extname(file));
    writer(resultString, baseName);
  });

  console.log(`✅ Generated ${yamlFiles.length} type definition file(s)`);
}

export { generate };
