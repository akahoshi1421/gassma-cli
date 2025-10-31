import fs from "fs";
import path from "path";

const getTargetPath = (fileName: string): string => {
  // node_modules/gassmaが存在するか確認（本番環境の判定）
  const npmPath = path.resolve("./node_modules/gassma");
  const isDevelopment = !fs.existsSync(npmPath);

  // npm環境の場合: node_modules/gassmaに個別ファイルとして出力
  if(!isDevelopment) return path.join("./node_modules/gassma", `${fileName}.d.ts`);
  
  // 開発環境の場合: devTypesディレクトリに個別ファイルとして出力
  const devDir = "./devTypes";
  if (!fs.existsSync(devDir))
    fs.mkdirSync(devDir, { recursive: true });
  return path.join(devDir, `${fileName}.d.ts`);
};

export { getTargetPath };
