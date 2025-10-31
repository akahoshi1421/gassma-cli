import fs from "fs";
import path from "path";
import { getTargetPath } from "./util/getTargetPath";

const writer = (resultTypeString: string, fileName: string) => {
  const targetPath = getTargetPath(fileName);

  // ディレクトリが存在することを確認
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(targetPath, resultTypeString);
  console.log(`✅ Generated: ${targetPath}`);
};

export { writer };
