import { describe, it, expect } from "vitest";
import { execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { generater } from "../../generate/generator";
import { generateClientDts } from "../../generate/jsGenerate/generateClientDts";
import { prismaReader } from "../../generate/read/prismaReader";
import { extractRelations } from "../../generate/read/extractRelations";

const tscPath = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "node_modules",
  ".bin",
  "tsc",
);

const runTsc = (tmpDir: string, tsconfigPath: string): string => {
  try {
    return execSync(`${tscPath} --project ${tsconfigPath} 2>&1`, {
      encoding: "utf-8",
      cwd: tmpDir,
    });
  } catch (e) {
    const error = e as { stdout?: string; stderr?: string };
    return error.stdout ?? error.stderr ?? "unknown error";
  }
};

const writeTsconfig = (tsconfigPath: string) => {
  fs.writeFileSync(
    tsconfigPath,
    JSON.stringify({
      compilerOptions: {
        strict: true,
        noEmit: true,
        skipLibCheck: false,
        lib: ["ES2021"],
      },
      include: ["*.d.ts"],
    }),
  );
};

const generateFromPrisma = (
  prismaPath: string,
  schemaName?: string,
): string => {
  const schemaText = fs.readFileSync(prismaPath, "utf-8");
  const parsed = prismaReader(schemaText);
  const relations = extractRelations(schemaText);
  return generater(parsed, relations, schemaName);
};

describe("schema name collision", () => {
  // 同名モデル（User）を持つ複数スキーマを別 schemaName で生成しても型名が衝突しないこと
  it("should not collide when multiple schemas have the same model name", () => {
    const hogePath = path.join(__dirname, "fixtures", "hoge.prisma");
    const fugaPath = path.join(__dirname, "fixtures", "fuga.prisma");
    const hogeMerged = `${generateFromPrisma(hogePath, "Hoge")}\n${generateClientDts("Hoge")}`;
    const fugaMerged = `${generateFromPrisma(fugaPath, "Fuga")}\n${generateClientDts("Fuga")}`;

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-collision-"));
    const tsconfigPath = path.join(tmpDir, "tsconfig.json");

    try {
      fs.writeFileSync(path.join(tmpDir, "hogeClient.d.ts"), hogeMerged);
      fs.writeFileSync(path.join(tmpDir, "fugaClient.d.ts"), fugaMerged);
      writeTsconfig(tsconfigPath);

      const result = runTsc(tmpDir, tsconfigPath);
      expect(result).toBe("");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
