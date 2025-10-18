import fs from "fs";
import path from "path";

const writer = (resultTypeString: string) => {

  // node_modules/gassmaが存在するか確認
  const npmPath = path.resolve("./node_modules/gassma");
  const targetPath = fs.existsSync(npmPath) 
    ? "./node_modules/gassma/index.d.ts"  // npmパッケージとして使用されている場合
    : "./indexDev.d.ts";  // 開発環境の場合

  // ディレクトリが存在することを確認
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  

  fs.writeFileSync(targetPath, resultTypeString);
  console.log(`✅ Type definitions generated at: ${targetPath}`);
};

export { writer };
