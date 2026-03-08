import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { generater } from "../../generate/generator";
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
  let result = "";
  try {
    result = execSync(`${tscPath} --project ${tsconfigPath} 2>&1`, {
      encoding: "utf-8",
      cwd: tmpDir,
    });
  } catch (e) {
    const error = e as { stdout?: string; stderr?: string };
    result = error.stdout ?? error.stderr ?? "unknown error";
  }
  return result;
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
  includeCommon?: boolean,
): string => {
  const schemaText = fs.readFileSync(prismaPath, "utf-8");
  const parsed = prismaReader(schemaText);
  const relations = extractRelations(schemaText);
  return generater(parsed, relations, schemaName, includeCommon);
};

describe("generated .d.ts type check", () => {
  it("should pass tsc --noEmit without type errors", () => {
    const prismaPath = path.join(__dirname, "fixture.prisma");
    const generated = generateFromPrisma(prismaPath);

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-typecheck-"));
    const tsconfigPath = path.join(tmpDir, "tsconfig.json");

    try {
      fs.writeFileSync(path.join(tmpDir, "generated.d.ts"), generated);
      writeTsconfig(tsconfigPath);

      const result = runTsc(tmpDir, tsconfigPath);
      expect(result).toBe("");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("should not collide when multiple schemas have the same model name", () => {
    const hogePath = path.join(__dirname, "fixture-hoge.prisma");
    const fugaPath = path.join(__dirname, "fixture-fuga.prisma");
    const hogeGenerated = generateFromPrisma(hogePath, "Hoge");
    const fugaGenerated = generateFromPrisma(fugaPath, "Fuga", false);

    const tmpDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "gassma-typecheck-multi-"),
    );
    const tsconfigPath = path.join(tmpDir, "tsconfig.json");

    try {
      fs.writeFileSync(path.join(tmpDir, "hoge.d.ts"), hogeGenerated);
      fs.writeFileSync(path.join(tmpDir, "fuga.d.ts"), fugaGenerated);
      writeTsconfig(tsconfigPath);

      const result = runTsc(tmpDir, tsconfigPath);
      expect(result).toBe("");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
