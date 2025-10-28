import fs from "fs";
import path from "path";

const writer = (resultTypeString: string, fileName: string) => {
  // node_modules/gassmaが存在するか確認（本番環境の判定）
  const npmPath = path.resolve("./node_modules/gassma");
  const isDevelopment = !fs.existsSync(npmPath);
  
  let targetPath: string;
  
  if (isDevelopment) {
    // 開発環境の場合: devTypesディレクトリに個別ファイルとして出力
    const devDir = "./devTypes";
    if (!fs.existsSync(devDir)) {
      fs.mkdirSync(devDir, { recursive: true });
    }
    targetPath = path.join(devDir, `${fileName}.d.ts`);
  } else {
    // npm環境の場合: node_modules/gassmaに個別ファイルとして出力
    targetPath = path.join("./node_modules/gassma", `${fileName}.d.ts`);
  }

  // ディレクトリが存在することを確認
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(targetPath, resultTypeString);
  console.log(`    ✅ Generated: ${targetPath}`);
};

export { writer };
